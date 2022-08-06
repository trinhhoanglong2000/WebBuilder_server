$(document).find('[name="slideshowGallery"]').each(function() {
    const curSlide = $(this).find('.mySlides img');
    const optionImage = $(this).find('img.option-image');
    const prevBtn= $(this).find('a.prev');
    const nextBtn = $(this).find('a.next');

    optionImage.on("click", function() {
        optionImage.each(function() { $(this).removeClass('active'); })
        $(this).addClass('active');
        $(curSlide).attr('src', $(this).attr('src'))
    })

    prevBtn.on("click", () => {
        const active = $(this).find('img.option-image.active')
        const index = $(active).parent().closest('div').index() - 1;
        if (index > -1 && index < optionImage.length) { 
            $(active).removeClass('active');
            $(optionImage[index]).addClass('active');

            $(curSlide).attr('src', $(optionImage[index]).attr('src'))
        }
    })

    nextBtn.on("click", () => {
        const active = $(this).find('img.option-image.active')
        const index = $(active).parent().closest('div').index() + 1;
        
        if (index > -1 && index < optionImage.length) { 
            $(active).removeClass('active');
            $(optionImage[index]).addClass('active');

            $(curSlide).attr('src', $(optionImage[index]).attr('src'))
        }
    })
});