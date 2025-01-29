// heureka-reviews.js
$(document).ready(function() {
    var HeurekaCountry = { CZ: 1, SK: 2, HU: 3 };
    var HeurekaReviewsTemplateType = { DEFAULT: 0, STYLE1: 1, STYLE2: 2, STYLE3: 3 };

    function getStarRating(rating) {
        if (rating >= 4.5) return '★★★★★';
        if (rating >= 3.5) return '★★★★☆';
        if (rating >= 2.5) return '★★★☆☆';
        if (rating >= 1.5) return '★★☆☆☆';
        return '★☆☆☆☆';
    }

    if (window.location.pathname === '/') {
        let shopId = '';
        document.querySelectorAll('script').forEach(script => {
            if (script.src.includes('heureka-fetch-data.js')) {
                const url = new URL(script.src);
                const params = new URLSearchParams(url.search);
                shopId = params.get('shopId');
            }
        });

        $.ajax({
            url: `https://addons-shoptet.adamzatopek.cz/heureka-reviews/heureka_data.php?shopId=${shopId}`,
            type: 'GET',
            dataType: 'json',
            success: function(response) {
                if (response.error) {
                    console.error("Chyba: " + response.error);
                    return;
                }

                let reviewsUrl = response.reviewsUrl || "";
                let heurekaShopName = response.HeurekaShopName || "";
                let heurekaReviewsTitle = response.HeurekaReviewsTitle || "";
                var heurekaCountry = response.HeurekaCountry;
                var heurekaReviewsTemplateType = response.HeurekaReviewsTemplateType;
                var reviewsCount = response.totalCount;

                if(reviewsCount===0)
                {
                    console.error("Počet recenzí je: " + reviewsCount);
                    return;
                }
                var imgSourceClass = {
                    [HeurekaCountry.CZ]: "review-cz",
                    [HeurekaCountry.SK]: "review-sk",
                    [HeurekaCountry.HU]: "review-hu"
                };
                var countryTitles = {
                    [HeurekaCountry.CZ]: "Hodnocení obchodu",
                    [HeurekaCountry.SK]: "Hodnotenie obchodu",
                    [HeurekaCountry.HU]: "Az üzlet értékelése"
                };
                var countryCustomer = {
                    [HeurekaCountry.CZ]: "Ověřený zákazník",
                    [HeurekaCountry.SK]: "Overený zákazník",
                    [HeurekaCountry.HU]: "Ellenőrzött ügyfél"
                };
                var countryTranslations = {
                    [HeurekaCountry.CZ]: ["Obchod", "hodnotilo", "zákazníků."],
                    [HeurekaCountry.SK]: ["Obchod", "hodnotilo", "zákazníkov."],
                    [HeurekaCountry.HU]: ["Kereskedelmi", "értékelték", "vásárlók."]
                };

                var reviewClass = {
                    [HeurekaReviewsTemplateType.DEFAULT]: "review-default",
                    [HeurekaReviewsTemplateType.STYLE1]: "review-style1",
                    [HeurekaReviewsTemplateType.STYLE2]: "review-style2",
                    [HeurekaReviewsTemplateType.STYLE3]: "review-style3"
                }[heurekaReviewsTemplateType] || "review-default";

                // Parsování XML obsahu
                var parser = new DOMParser();
                var xmlDoc = parser.parseFromString(response.html, "text/xml");
                var reviews = xmlDoc.getElementsByTagName('review');

                var reviewsArray = [];
                let totalRatingSum = response.totalSum;

                for (let i = 0; i < reviews.length; i++) {
                    var rating = parseFloat(reviews[i].getElementsByTagName('total_rating')[0]?.textContent || 0);
                    

                    var unixTimestamp = parseInt(reviews[i].getElementsByTagName('unix_timestamp')[0]?.textContent || 0);
                    var date = new Date(unixTimestamp * 1000);
                    var formattedDate = date.toLocaleDateString('cs-CZ');

                    var summary = reviews[i].getElementsByTagName('summary')[0]?.textContent || "";
                    var prosText = reviews[i].getElementsByTagName('pros')[0]?.textContent || "";
                    var varext = reviews[i].getElementsByTagName('cons')[0]?.textContent || "";
                    var prosArray = prosText.split('\n').map(item => item.trim()).filter(item => item);
                    var consArray = varext.split('\n').map(item => item.trim()).filter(item => item);

                    reviewsArray.push({
                        rating: rating,
                        date: formattedDate,
                        summary: summary,
                        pros: prosArray,
                        cons: consArray
                    });
                }

                var averageRating = totalRatingSum / reviewsCount;
                var averageRatingPercent = ((averageRating / 5) * 100).toFixed(1).replace('.', ',');
                if (averageRatingPercent.endsWith(',0')) {
                    averageRatingPercent = averageRatingPercent.replace(',0', '');
                }

                var reviewsHtml = `<h2 class="reviews-header">${heurekaReviewsTitle || countryTitles[heurekaCountry]}</h2>` +
                    `<div class="reviews-content ${reviewClass}">` +
                    `    <div class="reviews-total-rating"><span class="value">${averageRatingPercent} %</span>&nbsp;&nbsp;<span class="store-stars">${getStarRating(averageRating)}</span></div>` +
                    `    <div class="store-info">` +
                    (heurekaShopName ? `${countryTranslations[heurekaCountry][0]} <a href="${reviewsUrl}">${heurekaShopName}</a> ${countryTranslations[heurekaCountry][1]} <span class="numb-of-customers">${reviewsCount}</span> ${countryTranslations[heurekaCountry][2]}.` : `${countryTranslations[heurekaCountry][0]} ${countryTranslations[heurekaCountry][1]} <span class="numb-of-customers">${reviews.length}</span> ${countryTranslations[heurekaCountry][2]}.`) +
                    `</div>` +
                    `    <div class="reviews-carousel">` +
                    `        <div class="prev-reviews"></div>` +
                    `        <div class="reviews-wrapper">` +
                    `            <div class="reviews">`;

                reviewsArray.forEach(function(review) {
                    reviewsHtml += `<div class="review ${imgSourceClass[heurekaCountry]}">` +
                        `    <div class="review-header">` +
                        `        <div class="name">${countryCustomer[heurekaCountry]}</div>` +
                        `        <div class="date">${review.date}</div>` +
                        `        <div class="review-stars">${getStarRating(review.rating)}</div>` +
                        `    </div>` +
                        `    <div class="review-content">` +
                        `        <div class="review-summary">${review.summary}</div>` +
                        `        <div class="pros-content">` + review.pros.map(pro => `<div class="pros">${pro}</div>`).join('') + `</div>` +
                        `        <div class="cons-content">` + review.cons.map(con => `<div class="cons">${con}</div>`).join('') + `</div>` +
                        `    </div>` +
                        `</div>`;
                });

                reviewsHtml += `            </div>` +
                    `        </div>` +
                    `        <div class="next-reviews"></div>` +
                    `    </div>` +
                    `</div>`;

                // Přidání do DOMu
                $('.overall-wrapper .content-wrapper.container:last .content').html(reviewsHtml);

                // Inicializace slideru
                initializeSlider();
            },
            error: function(error) {
                console.error("Došlo k chybě při načítání dat: ", error);
            }
        });
    }
});
