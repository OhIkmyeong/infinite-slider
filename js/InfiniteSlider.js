export class InfiniteSlider{
    constructor($slider){
        this.$slider = $slider;
        this.$$item = null;
        this.$wrap = null;
        this.$pager = null;
        this.$btnPrev = null;
        this.$btnNext = null;
        this.LEN = null;
        this.IDX_PREV = 0;
        this.IDX = 0;
        this.SIZE = {
            gap : null,
            wid : null,
            widWrap : null,
            sibHalf : null,
            per : null,
        };
        this.POS = {
            start : null,
            end : null
        }
        this.init();
    }//constructor

    /* [init] */
    init(){
        this.make_wrap();
        this.numbering_items();
        this.append_last_item_to_first();
        this.append_first_item_to_last()
        this.add_on_item_by_pager();
        this.make_pager();
        this.add_on_pager();
        this.make_btn_prev_next();
        this.cacul_size();

        this.move_slider_by_pager();

        //📌📌이벤트 추가
        /* 📌 resize */
        window.addEventListener('resize',this.cacul_size);

        /* 📌 pager */
        this.$pager.addEventListener('click',e=>{
            const $btn = e.target;
            if($btn.tagName != "BUTTON") return;

            //button.on 달기
            const idxBtn = Array.prototype.indexOf.call(this.$pager.children,$btn);
            this.IDX_PREV = this.IDX;
            this.IDX = idxBtn;
            this.add_on_pager();

            //slider 움직이기
            this.move_slider_by_pager();

            //item.on 달기
            this.add_on_item_by_pager();
        });

        /* 📌 prev, next 버튼에 이벤트 달기 */
        this.$btnPrev.addEventListener('click',()=>{
            this.move_general("prev");
        });
        
        this.$btnNext.addEventListener('click',()=>{
            this.move_general("next");
        });

        /* 📌 드래그에 이벤트 달기 */
        this.add_mouse_down();

        /* 📌 touch에 이벤트 달기 */
        this.$slider.addEventListener('touchstart',(e)=>{
            this.POS.start = e.changedTouches[0].clientX;
        });

        this.$slider.addEventListener('touchend',(e)=>{
            this.POS.end = e.changedTouches[0].clientX;
            const moveAmount = Math.abs(this.POS.end - this.POS.start);
            const winWidPer = window.innerWidth / 10;

            if(moveAmount > winWidPer){
                const direction = this.POS.start > this.POS.end ? "next" : "prev";
                this.move_general(direction);
            }
        });
    }//init

    /** 
     * prev,next,드래그,터치에 의한 변화 공통 
     * @param {String}direction "prev"|"next"
    */
    move_general(direction){
        this.IDX_PREV = this.IDX;
        if(direction == "prev"){
            this.IDX--;
        }else{
            this.IDX++;
        }
        // console.log("prev",this.IDX_PREV, "curr", this.IDX);
        this.add_on_pager();
        this.add_on_item_by_general();
        this.move_slider_by_general();
    }//move_general

    /** wrap을 추가하여, 그 안에 슬라이더를 넣습니다. */
    make_wrap(){
        this.$wrap = document.createElement('DIV');
        this.$wrap.classList.add('infinite-slider-wrap');

        const $sliderParent = this.$slider.parentElement;
        const $after = this.$slider.nextElementSibling;
        $sliderParent.appendChild(this.$wrap);
        if($after) $sliderParent.insertBefore(this.$wrap,$after);
    
        this.$wrap.appendChild(this.$slider);
    }//make_wrap

    /** 슬라이더의 아이템들에 넘버링을 추가합니다.. */
    numbering_items(){
        this.LEN = this.$slider.children.length;
        this.$$item = Array.from(this.$slider.children);
        this.$$item.forEach(($item,idx)=>{
            $item.dataset.sliderItem = idx;
        });
    }//numbering_items

    /** 해당 인덱스에 해당하는 아이템에 .on을 붙입니다. */
    add_on_item_by_pager(){
        const $on = this.$$item[this.IDX]; 
        this.$$item.forEach($item =>{
            $item.classList.toggle('on', $item == $on);
        });
        if(this.IDX == 0){
            this.$slider.children[1].classList.remove('on');
            this.$slider.children[this.LEN + 2].classList.remove('on');
        }

        if(this.IDX == this.LEN - 1){
            this.$slider.children[this.LEN + 2].classList.remove('on');
        }

        if(this.IDX == this.LEN){
            this.$slider.children[this.LEN + 2].classList.add('on');
        }

        if(this.IDX == 1 && this.IDX_PREV == this.LEN){
            this.$$item[0].classList.add('on');
        }

        if(this.IDX == - 1){
            this.$slider.children[1].classList.add('on');
        }

        if(this.IDX == this.LEN - 2 && this.IDX_PREV == - 1){
            this.$slider.children[1].classList.add('on');
            this.$$item[this.LEN - 1].classList.add('on');
        }
    }//add_on_item_by_pager

    /** item에 .on 붙이기(prev,next,드래그,터치) */
    add_on_item_by_general(){
        // console.log("prev",this.IDX_PREV, "curr", this.IDX);
        const $on = this.$$item[this.IDX];
        if(this.IDX >= this.LEN){
            const $fakeFirst = this.$slider.children[this.LEN + 2];
            const $first = this.$$item[0];
            $fakeFirst.classList.add('on');
            $first.classList.add('on');
        }else if(this.IDX < 0){
            const $fakeLast = this.$slider.children[1];
            const $last = this.$$item[this.LEN - 1];
            $fakeLast.classList.add('on');
            $last.classList.add('on');
        }else{
            Array.from(this.$slider.children).forEach($item =>{
                $item.classList.toggle('on', $item == $on);
            });
        }
    }//add_on_item_by_general

    /** 가장 마지막 아이템을 처음으로 붙입니다*/
    append_last_item_to_first(){
        const $first = this.$$item[0];
        const $last = this.$$item[this.LEN - 1];
        const $last2 = this.$$item[this.LEN - 2];
        const $cloneLast = $last.cloneNode(true);
        const $cloneLast2 = $last2.cloneNode(true);
        this.$slider.insertBefore($cloneLast,$first);
        this.$slider.insertBefore($cloneLast2,$cloneLast);
    }//append_last_item_to_first

    /** 가장 첫번째 아이템을 뒤로 붙인다*/
    append_first_item_to_last(){
        const $cloneFirst = this.$$item[0].cloneNode(true);
        const $cloneSecond = this.$$item[1].cloneNode(true);
        this.$slider.appendChild($cloneFirst);
        this.$slider.appendChild($cloneSecond);
    }//append_first_item_to_last

    /** pager를 만들고, 이벤트를 추가합니다 */
    make_pager(){
        this.$pager = document.createElement('DIV');
        this.$pager.classList.add('infinite-slider-pager');

        const $frag = document.createDocumentFragment();
        for(let i=0; i<this.LEN; i++){
            const $btn = document.createElement("BUTTON");
            $btn.dataset.sliderItem = i;
            $btn.title = i + 1;
            $frag.appendChild($btn);
        }   
        this.$pager.appendChild($frag);
        this.$wrap.appendChild(this.$pager);
    }//make_pager

    /**
     * pager에 클래스 on을 답니다.
     */
    add_on_pager(){
        let btnIdx;
        if(this.IDX > this.LEN - 1){
            btnIdx = 0
        }else if(this.IDX < 0){
            btnIdx = this.LEN - 1;
        }else{
            btnIdx = this.IDX;
        }
        const $btn = this.$pager.children[btnIdx]; 
        const $$sib = Array.prototype.filter.call(this.$pager.children, $sib => $sib !== $btn);
        $$sib.forEach($sib => $sib.classList.remove('on')); 
        $btn.classList.add('on');
    }

    /** btn-prev,next를 만들고 이벤트를 추가합니다. */
    make_btn_prev_next(){
        this.$btnPrev = document.createElement('BUTTON');
        this.$btnNext = document.createElement('BUTTON');

        this.$btnPrev.classList.add('infinite-slider-btn-prev');
        this.$btnNext.classList.add('infinite-slider-btn-next');

        this.$btnPrev.title = "이전";
        this.$btnNext.title = "다음";

        this.$wrap.appendChild(this.$btnPrev);
        this.$wrap.appendChild(this.$btnNext);
    }//make_btn_prev_next

    /** 
     * move Slider(페이저) 총괄
     * */
    move_slider_by_pager(){
        // console.log("prev",this.IDX_PREV, "now",this.IDX);
        if(this.IDX == 0 && this.IDX_PREV == this.LEN - 1){
            this.IDX = this.LEN;
            this.move_slider_only();
            this.IDX_PREV = this.IDX;
        }else if(this.IDX == 0 && this.IDX_PREV == this.LEN){
            this.$slider.classList.add('off-transition');
            this.move_slider_only();
            setTimeout(()=>{
                this.$slider.classList.remove('off-transition');
            },0);
        }else if(this.IDX == 1 && this.IDX_PREV == this.LEN){
            this.$slider.classList.add('off-transition');
            setTimeout(async()=>{
                await this.fake_move_to_first();
                this.$$item[0].classList.remove('on');
                this.move_slider_only();
            },250);
        }else if(this.IDX == this.LEN - 1 && this.IDX_PREV == 0){
            this.IDX = -1;
            this.move_slider_only();
            this.IDX_PREV = this.IDX;
        }else if(this.IDX == this.LEN - 2 && this.IDX_PREV == -1){
            this.$slider.classList.add('off-transition');
            setTimeout(async()=>{
                await this.fake_move_to_last();
                this.$$item[this.LEN - 1].classList.remove('on');
                this.move_slider_only();
            },250);
        }else{
            this.move_slider_only();
        }
    }//move_slider_by_pager

    /** prev,next,드래그,터치로 이동할 때 */
    move_slider_by_general(){
        this.move_slider_only();
        if(this.IDX >= this.LEN){
            this.$slider.addEventListener('transitionend',()=>{
                this.$slider.classList.add('off-transition');
                this.IDX = 0;
                this.move_slider_only();
                setTimeout(()=>{
                    this.$slider.classList.remove('off-transition');
                },10);
            },{once:true});
        }else if(this.IDX < 0){
            this.$slider.addEventListener('transitionend',()=>{
                this.$slider.classList.add('off-transition');
                this.IDX = this.LEN - 1;
                this.move_slider_only();
                setTimeout(()=>{
                    this.$slider.classList.remove('off-transition');
                },10);
            },{once:true});
        }
    }//move_slider_by_general

    move_slider_only(){
        this.cacul_size_per_only();
        this.$slider.style.transform = `translateX(${this.SIZE.per * -1}px)`;
    }//move_slider_only

    fake_move_to_first(){
        return new Promise(res=>{
            this.IDX = 0;
            this.move_slider_only();
            setTimeout(()=>{
                this.IDX = 1;
                this.$slider.classList.remove('off-transition');
                res(true);
            },200);
        });
    }

    fake_move_to_last(){
        return new Promise(res => {
            this.IDX = this.LEN - 1;
            this.move_slider_only();
            setTimeout(()=>{
                this.IDX = this.LEN - 2;
                this.$slider.classList.remove('off-transition');
                res();
            },200);
        });
    }
    
    cacul_size = () =>{
        this.SIZE.gap =  window.innerWidth < window.innerHeight ? window.innerWidth / 100 * 5 : window.innerHeight / 100 * 5;
        this.SIZE.wid = this.$slider.children[0].offsetWidth ;
        this.SIZE.widWrap = this.$wrap.offsetWidth;
        this.SIZE.sibHalf = (this.SIZE.widWrap - (this.SIZE.wid + this.SIZE.gap * 2)) / 2;
        this.cacul_size_per_only();
    }//cacul_size

    cacul_size_per_only(){
        this.SIZE.per = (this.SIZE.wid * (this.IDX + 2)) - this.SIZE.sibHalf + (this.SIZE.gap * (this.IDX + 1));
    }//cacul_size_per_only

    add_mouse_down(){
        this.$slider.addEventListener('mousedown',(e)=>{
            this.POS.start = e.clientX;
            this.$slider.style.cursor = 'grabbing';
            this.add_mouse_up();
        },{once:true});
    }//add_mouse_down

    add_mouse_up(){
        this.$slider.addEventListener('mouseup',(e)=>{
            this.POS.end = e.clientX;
            const moveAmount = Math.abs(this.POS.end - this.POS.start);
            const winWidPer = window.innerWidth / 10;

            if(moveAmount > winWidPer){
                console.log(moveAmount,winWidPer);
                const direction = this.POS.start > this.POS.end ? "next" : "prev";
                this.move_general(direction);
            }
            this.$slider.style.cursor = 'grab';
            this.add_mouse_down();
        },{once:true});
    }//add_mouse_up
}//class-InfiniteSlider