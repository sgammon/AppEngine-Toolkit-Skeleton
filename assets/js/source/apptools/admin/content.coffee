## Content Management
class ContentManagerAPI extends CoreAdminAPI

    @mount = 'content'
    @events = []

    constructor: (apptools, admin, window) ->

        editing = false
        style_cache = {}
        state = {}
        change_count = 0

        features =
            panel:
                commands:
                    undo: () ->
                        document.execCommand 'undo'
                    redo: () ->
                        document.execCommand 'redo'
                    cut: () ->
                        document.execCommand 'cut'
                    paste: () ->
                        document.execCommand 'paste'
                    table: () ->
                        document.execCommand 'enableInlineTableEditing'
                    resize: () ->
                        document.execCommand 'enableObjectResizing'
                    clip: null
                    b: () ->
                        document.execCommand 'bold'
                    u: () ->
                        document.execCommand 'underline'
                    i: () ->
                        document.execCommand 'italic'
                    clear: () ->
                        document. execCommand 'removeFormat'
                    h1: () ->
                        t = if document.selection then document.selection() else window.getSelection()
                        document.execCommand 'insertHTML', false, '<h1 class="h1">'+String(t)+'</h1>'
                    h2: () ->
                        t = if document.selection then document.selection() else window.getSelection()
                        document.execCommand 'insertHTML', false, '<h2 class="h2">'+String(t)+'</h2>'
                    h3: () ->
                        t = if document.selection then document.selection() else window.getSelection()
                        document.execCommand 'insertHTML', false, '<h3 class="h3">'+String(t)+'</h3>'
                    fontColor: () ->
                        t = if document.selection then document.selection() else window.getSelection()
                        c = prompt 'Please enter a hexidecimal color value (i.e. #ffffff)'
                        c = if c[0] is '#' then c else '#' + c
                        document.execCommand 'insertHTML', false, '<span style="color:'+c+';">'+t+'</span>'
                    fontSize: () ->
                        t = if document.selection then document.selection() else window.getSelection()
                        s = prompt 'Please enter desired point size (i.e. 10)'
                        document.execCommand 'insertHTML', false, '<span style="font-size:'+s+'pt;">'+t+'</span>'
                    fontFace: null
                    l: () ->
                        document.execCommand 'justifyLeft'
                    r: () ->
                        document.execCommand 'justifyRight'
                    c: () ->
                        document.execCommand 'justifyCenter'
                    in: () ->
                        document.execCommand 'indent'
                    out: () ->
                        document.execCommand 'outdent'
                    bullet: () ->
                        document.execCommand 'insertUnorderedList'
                    number: () ->
                        document.execCommand 'insertOrderedList'
                    indentSpecial: null
                    lineSpacing: null
                    link: () ->
                        t = if document.selection then document.selection() else window.getSelection()
                        if not util.is t
                            t = prompt "What link text do you want to display?"
                        l = prompt 'What URL do you want to link to?'
                        document.execCommand 'insertHTML', false, '<a href="'+l+'">'+t+'</a>'
                    image: null
                    video: null

                panel_html: ['<div id="CMS_wrap">', '<div id="CMS_panel" class="fixed panel" style="opacity: 0;">', '<div id="CMS_frame" class="nowrap">', '<div class="cms_pane" id="buttons">', '<div class="cms_subpane">', '<h1 class="cms_sp">editing</h1>', '<p>', '<button id="cms_undo" value="undo">undo</button>', '<button id="cms_redo" value="redo">redo</button>', '<button id="cms_cut" value="cut">cut</button>', '<button id="cms_paste" value="paste">paste</button>', '</p>', '</div>', '<hr/>', '<div class="cms_subpane">', '<h1 class="cms_sp">typography</h1>', '<p>', '<select id="cms_headers" class="cms">', '<option id="cms_h1" class="h1">Heading 1</option>', '<option id="cms_h2" class="h2">Heading 2</option>', '<option id="cms_h3" class="h3">Heading 3</option>', '</select>', '<button id="cms_b" value="bold">B</button>', '<button id="cms_u" value="underline">U</button>', '<button id="cms_i" value="italic">I</button>', '<button id="cms_clear" value="clear formatting">clear</button>', '<button id="cms_fontColor" value="font color">font color</button>', '<button id="cms_fontSize" value="font size">font size</button>', '</p>', '</div>', '<hr/>', '<div class="cms_subpane">', '<h1 class="cms_sp">alignment</h1>', '<p style="text-lign:center">', '<button id="cms_l" value="left">left</button>', '<button id="cms_c" value="center">center</button>', '<button id="cms_r" value="right">right</button>', '<br>', '<button id="cms_in" value="indent">&raquo;</button>', '<button id="cms_out" value="outdent">&laquo;</button>', '<br>', '<button id="cms_ul" value="unordered list">&lt;ul&gt;</button>', '<button id="cms_ol" value="ordered list">&lt;ol&gt;</button>', '</p>', '</div>', '<hr/>', '<div class="cms_subpane">', '<h1 class="cms_sp">interactive</h1>', '<p>', '<button id="cms_link" value="link">add link</button>', '</p>', '</div>', '</div>', '<div class="cms_pane" id="styles">', '<div class="cms_subpane">', '<h1 class="cms_sp">styles</h1>', '<p>MIDDLE</p>', '</div>', '</div>', '<div class="cms_pane" id="assets">','<div class="cms_subpane">','<h1 class="cms_sp">drop files here</h1>','<div id="upload_wrap">','<div id="upload" class="dragdrop">','<span class="center-text" id="up_content">+</span>','</div>','</div>','</div>','<hr>','<div class="cms_subpane">','<h1 class="cms_sp">uploaded assets</h1>','<p>','<button id="pop_assets_button" class="pop" name="assets" value="pop out this pane!">pop me out</button>','</p>','</div>','</div>','</div>', '<div id="CMS_nav">', '<a class="scroll" href="#buttons">buttons</a>', '<a class="scroll" href="#styles">styles</a>', '<a class="scroll" href="#assets">assets</a>', '</div>', '<div id="CMS_panel_footer">&copy; momentum labs 2012</div>', '</div>', '</div>'].join '\n'
                status_html: '<div class="fixed panel bigger" id="cms_edit_on" style="vertical-align: middle; left: -305px;top: 50px;width: 300px;text-align: right;padding-right: 10px;opacity: 0;"><span id="cms_span" style="color: #222;cursor: pointer">content editing <span style="color: green;font-weight: bold;">ON</span></span></div>'
                init: false

            scroller:
                animation:
                    duration: 500
                    easing: 'easeInOutExpo'
                    complete: null

                axis: 'horizontal'
                frame: 'CMS_frame'
                init: false

            pop:
                animation:
                    duration: 500
                    easing: 'easeInOutExpo'
                    complete: null

                position:
                    bottom: '60px'
                    right: '60px'

                init: false

            modal:
                animation:
                    duration: 400
                    easing: 'easeInOutExpo'
                    complete: null

                initial:
                    width: '0px'
                    height: '0px'
                    top: window.innerHeight/2 + 'px'
                    left: window.innerWidth/2 + 'px'

                ratio:
                    x: 0.4
                    y: 0.4

                html: ['<div id="modal_wrap" style="opacity: 0;" class="modal_wrap">','<div id="modal" style="opacity: 0;" class="fixed modal">','<div id="modal_status"></div>','<div id="modal_content">','*****','</div>','<div id="modal_ui"><button id="mod-close">close</button></div>','</div>','</div>'].join '\n'
                content: '<span style="font-size: 25px;margin: 10px auto;color: #5f5f5f;font-weight:bold">hello, lightbox!</span>'
                rounded: true
                init: false

            overlay: '<div id="m-overlay" class="fixed" style="opacity: 0;"></div>'
            init: false

        @config = $.extend true, {}, features

        @util =

            bind: (obje, eve, fnc) =>

                rObj = {}
                rObj[eve] = fnc

                return obje.bind(rObj)

            imgPreview: (eV) =>

                res = eV.target.result

                img = document.createElement 'img'
                img.classList.add 'preview'
                img.src = res

                document.getElementById('upload').appendChild img

            is: (thing) =>

                if $.inArray(thing, [false, null, NaN, undefined, 0, {}, [], '','false', 'False', 'null', 'NaN', 'undefined', '0', 'none', 'None']) is -1
                    return true
                else
                    return false

            isID: (str) =>
                if String(str).split('')[0] is '#' or document.getElementById(str) != null
                    return true
                else
                    return false

            handleDrag: (evE) =>

                e.preventDefault()
                e.stopPropagation()

                eT = e.target

                if e.type is 'dragenter'
                    $(eT).addClass 'hover'
                else if e.type != 'dragover'
                    $(eT).removeClass 'hover'

            makeDragDrop: (elem) =>

                elem.addEventListener 'dragenter', @util.handleDrag, false
                elem.addEventListener 'dragexit', @util.handleDrag, false
                elem.addEventListener 'dragleave', @util.handleDrag, false
                elem.addEventListener 'dragover', @util.handleDrag, false
                elem.addEventListener 'drop', @uploadAsset, false

            wrap: (func) =>

                args = Array.prototype.slice.call arguments, 1
                () ->
                    func.apply @, args

        @edit =  (o) =>

            $o = $(o)
            offset = $o.offset()
            $id = $o.attr 'id'
            console.log 'Enabling inline editing of #'+$id

            o.contentEditable = true
            editing = true
            style_cache[$id] = $o.attr 'style'
            state[$id] = $o.html()

            $o.unbind 'click'

            $('body').append(@config.overlay)
            $('#m-overlay').animate
                'opacity': 0.75
            ,
                duration: 400
                easing: 'easeInOutExpo'

            $o.css
                'z-index': () ->
                    z = 900 + Math.floor Math.random()*81
            $o.offset offset

            if not @util.isID 'CMS_panel'
                @panel.make()
                @panel.live()

            $('#m-overlay').bind
                click: @util.wrap @save, o

        @save = (ob) =>

            $o = $(ob)
            $id = $o.attr('id')
            inHTML = $o.html()
            $kn = if $o.data('snippet-keyname') then $o.data('snippet-keyname') else 'default-key'
            that = @

            ob.contentEditable = false
            editing = false

            @panel.destroy()
            @util.bind $o, 'click', @util.wrap @edit, ob

            if not @util.isID 'CMS_sync'
                $('body').append '<div class="cms_message warn" id="CMS_sync" style="top: 50px;opacity: 0;"><div id="sync_loader" class="loader">syncing changes...</div></div>'

            $('#m-overlay').animate
                'opacity': 0
            ,
                duration: 500
                easing: 'easeInOutExpo'
                complete: () ->
                    $('#m-overlay').remove()
                    if inHTML != state[$id]
                        $('#CMS_sync').animate
                            'opacity': 1
                        ,
                            duration: 700
                            easing: 'easeInOutExpo'
                            complete: () ->
                                change_count++
                                that.sync
                                    snippet_keyname: $kn
                                    inner_html: inHTML

        @sync = (snippetObj) =>

            that = @
            $.apptools.dev.verbose 'CMS', 'Initiating sync operation for snippet.', snippetObj
            $.apptools.api.content.save_snippet(snippetObj).fulfill
                success: () ->
                    if change_count - 1 is 0
                        $('#CMS_sync').html 'changes saved!'
                        $('#CMS_sync').removeClass('warn').removeClass('error').addClass('yay')
                        setTimeout () ->
                            $('#CMS_sync').animate
                                'opacity': 0
                            ,
                                duration: 500
                                easing: 'easeInOutExpo'
                                complete: () ->
                                    $('#CMS_sync').remove()
                        , 700
                        change_count--
                    else
                        change_count--

                failure: (error) ->
                    $('#CMS_sync').html 'error syncing page.'
                    $('#CMS_sync').removeClass('warn').addClass('error')
                    setTimeout () ->
                        $('#CMS_sync').append '<br><a id="sync_retry" style="pointer: cursor;text-decoration: underline;">retry sync</a>'
                        that.util.bind $('#sync_retry'), 'click', that.util.wrap(that.sync, snippetObj)
                    , 1500

        @revert = (obj) =>

            _kn = $(obj).data('snippet-keyname')

            $.apptools.api.content.revert_snippet
                snippet_keyname: _kn
            .fulfill
                success: () ->
                    $(_o).html response.inner_html
                    $('body').append 'div id="CMS_revert" class="cms_message yay" style="opacity: 0;">changes reverted!</div>'
                    $('#CMS_revert').animate
                        'opacity': 1
                    ,
                        duration: 400
                        easing: 'easeInOutExpo'
                        complete: () ->
                            setTimeout () ->
                                $('#CMS_revert').animate
                                    'opacity': 0
                                ,
                                    duration: 500
                                    easing: 'easeInOutExpo'
                                    complete: () ->
                                        $('#CMS_revert').remove()
                            , 700

                failure: (error) ->
                    $('#CMS_revert').html 'error reverting page.'
                    $('#CMS_revert').removeClass('warn').addClass('error')

        @uploadAsset = (e) =>

            e.preventDefault()
            e.stopPropagation()

            $(e.target).removeClass('hover')
            files = e.dataTransfer.files

            readFile = (f) ->
                if f.type.match /image.*/
                    reader = new FileReader()
                    reader.onloadend = @util.imgPreview
                    reader.readAsDataURL(f)

            readFile file for file in files

        @placeAsset = (ev) =>

        @panel =

            make: () =>

                raw = @config.panel.panel_html
                $('body').append raw

                $('#CMS_panel').css 'bottom': '0px'
                $('#CMS_wrap').css 'opacity': 1

                $('#CMS_panel').animate
                    'bottom': '60px'
                    'opacity': 1
                ,
                    'duration': 500
                    'easing': 'easeInOutExpo'

            live: () =>

                cmds = @config.panel.commands
                frame = @config.scroller.frame
                up = document.getElementById 'upload'

                that = @
                $('.scroll').each () ->

                    t = @
                    $t = $(t)
                    rel = String($t.attr 'href').slice 1

                    $t.attr 'id', 'scr'+rel
                    $t.attr 'href', 'javascript:void(0);'

                    $('#'+frame).data 'scroller', axis: 'horizontal'

                    that.util.bind $t, 'click', that.util.wrap that.scroller.jump, rel

                    that.config.scroller.init = true

                @scroller.classify(frame)

                $('.pop').each () ->

                    t = @
                    $t = $(t)
                    rel = $t.attr 'name'

                    $t.removeAttr 'name'
                    $t.data 'pop', target: rel

                    that.util.bind $t, 'click', that.util.wrap that.pop.pop, rel

                    that.config.pop.init = true

                @util.makeDragDrop up

                @util.bind($('#cms_'+bu), 'click', axn) for bu, axn of cmds
                @config.panel.init = true

            die: () =>

                _cmds = @config.panel.commands
                $('#cms_'+_bu).unbind('click') for _bu, _axn of _cmds

            destroy: () =>

                $('#m-overlay').unbind()

                deep = true
                if editing is false

                    $('#CMS_panel').animate
                        'opacity': 0
                        'bottom': '0px'
                    ,
                        duration: 450
                        easing: 'easeInOutExpo'
                        complete: () ->
                            if deep is true
                                $('#CMS_wrap').remove()
                            else
                                $('#CMS_wrap').css 'opacity': 1

            toggle: () =>

                if @util.is $('#CMS_panel')
                    @panel.destroy
                    $('#cms_span').html '&gt;'

                else
                    @panel.make()
                    @panel.live()
                    $('#cms_span').html 'x'

        @scroller =

            classify: (ctx) =>

                $c = $('#'+ctx)
                $d = $c.data 'scroller'

                if ($d.axis is 'horizontal') || not @util.is($d.axis)
                    $('.cms_pane').removeClass('left').removeClass('clear').addClass('in-table')
                    $c.addClass 'nowrap'

                else if $d.axis is 'vertical'
                    $c.removeClass('nowrap')
                    $('.cms_pane').removeClass('in-table').addClass('left').addClass('clear')

            jump: (reL, cback, eVent) =>

                if @util.is e
                    e.preventDefault()
                    e.stopPropagation()

                $f = $('#'+@config.scroller.frame)
                $d = $f.data('scroller')
                anim = if @util.is cback then $.extend {}, @config.scroller.animation, complete:cback else @config.scroller.animation

                f_o = $f.offset()
                r_o = $('#'+reL).offset()

                if $d.axis is 'vertical'
                    diff = Math.floor r_o.top-f_o.top
                    $f.animate
                        scrollTop: '+='+diff
                    , anim

                else if $d.axis is 'horizontal'
                    diff = Math.floor r_o.left-f_o.left

                    $f.animate
                        scrollLeft: '+='+diff
                    , anim

        @pop =

            pop: (iD) =>
                that = @
                $t = $('#'+iD)
                piD = 'pop_' + iD
                biD = piD + '_button'

                pos = @config.pop.position
                pHTML = $t.html()
                prevSib = $t.prev().attr 'id'

                $b.unbind 'click'
                anim = $.extend {}, @config.pop.animation,
                    complete: () ->
                        $t.remove()
                        $('#'+biD).html 'pop back in'
                        that.util.bind $('#'+biD), 'click', that.util.wrap that.pop.reset, iD, 'CMS_frame'
                        that.util.makeDragDrop document.getElementById 'upload'

                popped = '<div id="'+piD+'" class="fixed panel" style="opacity:0;">'+pHTML+'</div>'
                $('body').append popped

                $('#'+piD).css
                    'bottom': '0px'
                    'right': pos.right
                    'z-index': 989

                $('#'+piD).animate
                    'bottom': pos.bottom
                    'opacity': 1
                , anim

                @scroller.jump prevSib

            reset: (id, tid) =>

                if tid is false or not @util.is tid
                    $('#pop_'+id).remove()
                else
                    that = @
                    pid = 'pop_'+iD
                    $tar = $('#'+tid)
                    bid = pid+'_button'

                    $(bid).unbind('click')

                    anim = $.extend {}, @config.pop.animation,
                        complete: () ->
                            $('#'+pid).remove()
                            $('#'+bid).html 'pop me out'
                            that.util.bind $('#'+bid), 'click', that.util.wrap that.pop.pop, id
                            that.util.makeDragDrop document.getElementById 'upload'

        @modal =

            show: (rEL, rELHTML, callBack) ->

                modalCSS = {opacity: 1}
                _anim = if @util.is callBack then $.extend {}, @config.modal.animation, complete: callBack else @config.modal.animation
                _html = @config.modal.html.split '*****'
                modalHTML = _html[0] + rELHTML + _html[1]
                modalWidth = Math.floor @config.modal.ratio.x*window.innerWidth
                modalHeight = Math.floor @config.modal.ratio.y*window.innerHeight

                modalCSS.width = modalWidth+'px'
                modalCSS.height = modalHeight+'px'
                modalCSS.top = Math.floor (window.innerHeight - modalHeight)/2
                modalCSS.left = Math.floor (window.innerWidth - modalWidth)/2

                $('body').append @config.overlay
                $('#m-overlay').animate opacity: 0.5,
                    duration: 400
                    easing: 'easeInOutExpo'
                    complete: () ->
                        @util.bind $('#m-overlay'), 'click', @modal.hide

                $('body').append modalHTML
                $('#modal-wrap').css opacity: 1

                if @config.modal.rounded
                    $('#modal').addClass 'rounded'
                $('#modal').css @config.modal.initial
                $('#modal').animate modalCSS, _anim
                @util.bind $('#mod-close'), 'click', @modal.hide

            hide: () ->

                $id = $('#modal')
                _end = $.extend {}, @config.modal.initial,
                    left: 0+'px'
                    width: window.innerWidth
                    right: 0+'px'
                    opacity: 0.5

                setTimeout () ->
                    $id.removeClass 'rounded'
                    $id.css padding: 0
                , 150

                $id.animate _end,
                    duration: 400
                    easing: 'easeInOutExpo'
                    complete: () ->
                        $id.animate opacity: 0,
                            duration: 250,
                            easing: 'easeInOutExpo'

                        $('#m-overlay').animate opacity: 0,
                            duration: 500,
                            easing: 'easeInOutExpo',
                            complete: () ->
                                $('#m-overlay').remove()
                                $('#modal_wrap').remove()


        apptools.dev.verbose 'CMS', 'Initializing Momentum extensible management system...'
        that = @
        $('body').append @config.panel.status_html
        setTimeout () ->
            $('#cms_span').animate
                'opacity': 1
            ,
                duration: 450
                easing: 'easeInOutExpo'

            $('#cms_edit_on').animate
                'opacity': 1,
                'left': '-155px'
            ,
                duration: 400
                easing: 'easeInOutExpo'
                complete: () ->
                    setTimeout () ->
                        $('#cms_edit_on').animate
                            'left': '-290px'
                        ,
                            duration: 400
                            easing: 'easeInOutExpo'
                            complete: () ->
                                that.util.bind $('#cms_edit_on'), 'click', that.panel.toggle
                                that.panel.toggle()
                    , 1750
        , 500

        `$('.editable').each(function(){
            var t = this;
            that.util.bind($(t), 'click', that.util.wrap(that.edit, t));
        });`


@__apptools_preinit.abstract_base_classes.push ContentManagerAPI
@__apptools_preinit.deferred_core_modules.push {module: ContentManagerAPI, package: 'admin'}
