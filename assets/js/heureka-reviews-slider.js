// heureka-reviews-slider.js
function initializeSlider() {
    var $reviews = $(".reviews");
    var $reviewElements = $(".review");
    var $prevButton = $(".prev-reviews");
    var $nextButton = $(".next-reviews");

    var currentIndex = 0;
    var autoSlideInterval;

    function getReviewsPerPage() {
        if ($(window).width() < 768) {
            return 1;
        } else if ($(window).width() < 992) {
            return 2;
        } else {
            return 3;
        }
    }

    function updateSlider() {
        var reviewWidth = $reviewElements.outerWidth(true);
        $reviews.css("transform", "translateX(-" + (currentIndex * reviewWidth) + "px)");
    }

    function nextReview() {
        var reviewsPerPage = getReviewsPerPage();
        if (currentIndex + reviewsPerPage >= $reviewElements.length) {
            currentIndex = 0;
        } else {
            currentIndex++;
        }
        updateSlider();
    }

    function prevReview() {
        if (currentIndex === 0) {
            currentIndex = $reviewElements.length - getReviewsPerPage();
        } else {
            currentIndex--;
        }
        updateSlider();
    }

    function startAutoSlide() {
        autoSlideInterval = setInterval(nextReview, 5000);
    }

    function stopAutoSlide() {
        clearInterval(autoSlideInterval);
    }

    $prevButton.on("click", function () {
        prevReview();
        stopAutoSlide();
        startAutoSlide();
    });

    $nextButton.on("click", function () {
        nextReview();
        stopAutoSlide();
        startAutoSlide();
    });

    $(window).on("resize", function () {
        updateSlider();
    });

    updateSlider();
    startAutoSlide();
}
