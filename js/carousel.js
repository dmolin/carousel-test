tash.namespace("namespace");

namespace.Carousel = function(sel){
    var selector = sel,
        el = $(selector),
        itemsEl = $('ul.items', el ),
        data = {wow:0},  //cached json data
        pageNo = 0,
        maxPages = 0,
        controlsEl,
        carousel = null;

    carousel = this;

    //----------------------
    // PRIVATE FUNCTIONS
    //----------------------
    function buildTitle() {
        $('#title')
            .empty()
            .append( '<h2><a href="instructions.html">' + data.carousel.format.heading + '</a></h2>' );
    }

    function buildCarousel() {
        el.append( '<ul class="items carousel-items"></ul>' );
        itemsEl = $('ul.items', el ); //or using 'deferred' ;)
    }

    function createItemList( page, itemList, isAtTheEnd ) {
        var il = itemList,
            items = data.carousel.items,
            loopIdx = 0,  //looping variable
            node; //iteration node

        if( isAtTheEnd ) {
            for( loopIdx = 0; loopIdx < data.carousel.format.paging; loopIdx++ ) {
                node = items[page * data.carousel.format.paging + loopIdx];
                il.append(tash.util.template( namespace.Carousel.templates.nodeTemplate, node ));
            }
        }
        else {
            for( loopIdx = data.carousel.format.paging-1; loopIdx >= 0; loopIdx-- ) {
                node = items[page * data.carousel.format.paging + loopIdx];
                il.prepend(tash.util.template( namespace.Carousel.templates.nodeTemplate, node ));
            }
        }
        return il;
    }

    function buildControls() {
        $('.controls',el).empty();

        el.append( tash.util.template( namespace.Carousel.templates.controlsTemplate, {} ) );
        controlsEl = $('div.controls', el);

        //add data information for each link in the controls element
        $( 'ul > li > a.control', controlsEl ).each( function() {
            var to = $(this).attr('to');
            if( typeof to === 'undefined' ) {
                if( $(this).hasClass("prev") ) {
                    to = "prev";
                }
                else if( $(this).hasClass("next")) {
                    to = "next";
                }
                else {
                    to = "0"; //default to first slideblock
                }
            }

            $(this).data( 'to', to );
            //remove the non-standard attribute
            $(this).removeAttr('to');
        } );

        //add bindings
        $("a.control", controlsEl ).click( function(e) {
            //prevent default behavior
            e.preventDefault();
            var to = $(this).data( 'to' );

            if( isNaN( parseInt(to,10) ) ) {
                //prev or next ?
                if( to === "prev" ) {
                    carousel.prev();
                }
                else if( to === "next" ) {
                    carousel.next();
                }
            }
            else {  //we have numbers
                carousel.slideTo( parseInt(to,10) );
            }

        } );
    }

    function setActiveControl() {
        var splitIdx;

        //unselect everything and
        //find control using its path as a reference
        $( 'a.control', controlsEl ).each( function() {
            $(this).removeClass('selected');
            if( parseInt($(this).data('to'),10) === pageNo ) {
                $(this).addClass('selected');
                //change the url
                splitIdx = $(this).attr('href').split('#');
                if( splitIdx.length > 1) {
                    document.location.hash = splitIdx[1];
                }
            }
        } );
    }


    //----------------------
    // PUBLIC FUNCTIONS
    //----------------------
    this.getData = function(){ return data; };
    this.getSelector = function(){ return selector; };
    this.getElement = function(){ return el; };
    this.reset = function() { this.slideTo(0); };
    this.next = function() {
        this.slideTo( pageNo+1 );
    };
    this.prev = function() {
        this.slideTo( pageNo-1 );
    };
    this.slideTo = function( index ) {
        var lastPage = pageNo; //store actual position before sliding..

        index = parseInt(index,10);

        //compute new page number
        pageNo = index >= maxPages ? 0 : index < 0 ? maxPages-1 : index;

        //update the control panel
        setActiveControl();

        var items = itemsEl;
        //if we have already elements, create a duplicate of all the list
        if( itemsEl.children().length > 0 )
        {
            items = $('<ul class="items carousel-items" style="position:absolute; width: 200%"></ul>' );
            //add actual items to the list
            $('li[class!=old_items]', itemsEl).appendTo( items );
            if( index < lastPage )
                items.css('left', '-100%' );

            //replace itemsEl with items
            $( 'ul.carousel-items', el ).remove();
            el.append( items );
            itemsEl = items;

            //mark as "old" (will slide out of view)
            $('li', itemsEl).addClass( 'old_items' );
        }

        //create the new items
        createItemList( pageNo, itemsEl, (index > lastPage ? true : false) );

        //when the first image ends loading up, calculate dimensions and position elements
        //this will avoid the controls jumping up/down when we destroy and refill the items list
        $('li:first img', itemsEl).load( function(){
            //resize main container and position controls
            if( el.height() < itemsEl.height() ) {
                el.height( el.height() + itemsEl.height() );
                controlsEl.css('position', 'absolute');
                controlsEl.css('bottom', '0px' );
            }
        } );

        //slide
        if( index !== lastPage ) {
            var pos;
            if( index > lastPage ) {
                pos = '-100%';
            }
            else {
                pos = '0%';
            }
            itemsEl.animate( {
                left: pos
            }, function() {
                //console.log( "finished" );
            });
        }
    };

    //-----------------------
    // MAIN LOGIC
    //-----------------------

    //approach: +CPU -DOM
    //load and create the elements
    $.getJSON('./basic_carousel.json', function(json){
            data = json.data;
            maxPages = data.carousel.items.length / data.carousel.format.paging;
            buildTitle();
            buildCarousel();
            buildControls();
            var hash = document.location.hash.substring(1);
            pageNo = parseInt(hash ? hash : 0, 10);
            carousel.slideTo( pageNo );
         } );
};

namespace.Carousel.templates = {
    nodeTemplate: [
            '<li>',
            '<span class="detail">',
                '<a href="{{url}}"><img src="images/{{img}}" alt="{{alt}}"/></a>',
                '<h3><a href="{{url}}">{{title}}</a></h3>',
                '<p>{{content}}</p>',
            '</span>',
            '</li>'
        ].join(''),
    controlsTemplate: ['<div class="controls">',
        '<ul>',
            '<li><a href="#prev" class="prev control" >Previous</a></li>',
            '<li><a href="#0" class="control" to="0" >1</a></li>',
            '<li><a href="#1" class="control" to="1" >2</a></li>',
            '<li><a href="#2" class="control" to="2" >3</a></li>',
            '<li><a href="#next" class="next control" >Next</a></li>',
        '</ul>',
        '</div>'].join('')
};

namespace.helpers = {
};

$(document).ready(function () {
    var carousel = new namespace.Carousel('#carousel');
});