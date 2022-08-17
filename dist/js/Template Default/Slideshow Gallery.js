function embedSlideShowGalarryData(deploy) {
    if (deploy) {
        $('[name="slideshowGallery"]').each(function() {
            const curSlide = $(this).find('.mySlides img');
            const optionImage = $(this).find('div:not(.d-none).column > img.option-image');
            const prevBtn= $(this).find('a.prev');
            const nextBtn = $(this).find('a.next');
            
            optionImage.on("click", function() {
                optionImage.each(function() { $(this).removeClass('active'); })
                $(this).addClass('active');
                $(curSlide).attr('src', $(this).attr('src'))
            })
    
            prevBtn.on("click", () => {
                const optionImage = $(this).find('div:not(.d-none).column > img.option-image')

                const active = $(this).find('img.option-image.active')
                const index = $(active).parent().closest('div').index() - 1;
                if (index > -1 && index < optionImage.length) { 
                    $(active).removeClass('active');
                    $(optionImage[index]).addClass('active');
    
                    $(curSlide).attr('src', $(optionImage[index]).attr('src'))
                }
            })
    
            nextBtn.on("click", () => {
                const optionImage = $(this).find('div:not(.d-none).column > img.option-image')

                const active = $(this).find('img.option-image.active');
                const index = $(active).parent().closest('div').index() + 1;
                
                if (index > -1 && index < optionImage.length) { 
                    $(active).removeClass('active');
                    $(optionImage[index]).addClass('active');
    
                    $(curSlide).attr('src', $(optionImage[index]).attr('src'))
                }
            })

            const active = $(this).find('img.option-image.active');
            $(curSlide).attr('src', $(active).attr('src'))
        });
    }
}

$(document).ready(function () {
    if ($('[data-gjs-type="wrapper"]').length) {
        $('[data-gjs-type="wrapper"]').ready(function () {
            embedSlideShowGalarryData(false);
        })
    }
    else {
        embedSlideShowGalarryData(true);
    } 
})
