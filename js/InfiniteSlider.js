export class InfiniteSlider{
    constructor($slider){
        this.$slider = $slider;
        this.init();
    }//constructor

    init(){
        this.add_wrap();
        this.numbering_items();
        this.add_on_item(0);
        this.append_last_item_to_first();
    }//init

    /** wrap을 추가하여, 그 안에 슬라이더를 넣습니다. */
    add_wrap(){
        this.$wrap = document.createElement('DIV');
        this.$wrap.classList.add('infinite-slider-wrap');

        const $sliderParent = this.$slider.parentElement;
        const $after = this.$slider.nextElementSibling;
        $sliderParent.appendChild(this.$wrap);
        if($after) $sliderParent.insertBefore(this.$wrap,$after);
    
        this.$wrap.appendChild(this.$slider);
    }//add_wrap

    /** 슬라이더의 아이템들에 넘버링을 추가합니다.. */
    numbering_items(){
        this.LEN = this.$slider.children.length;
        this.$$items = Array.from(this.$slider.children);
        this.$$items.forEach(($item,idx)=>$item.dataset.sliderItem = idx);
    }//numbering_items

    /** 해당 인덱스에 해당하는 아이템에 .on을 붙입니다. */
    add_on_item(idx){
        this.$slider.children[idx].classList.add('on');
    }//add_on_item

    /** 가장 마지막 아이템을 처음으로 붙입니다*/
    append_last_item_to_first(){
        const $first = this.$slider.children[0];
        const $last = this.$slider.children[this.LEN - 1];
        this.$slider.insertBefore($last,$first);
    }//append_last_item_to_first
}//class-InfiniteSlider