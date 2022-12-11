set encoding=utf-8
set fileencoding=utf-8
set shortmess=filnxtToOI
set guifont=Consola:h10
set gdefault
set nu

hi LightspeedCursor gui=reverse
let mapleader = ' '
let maplocalleader = '\'

if has('nvim')
    call plug#begin()
    Plug 'tpope/vim-repeat'
    Plug 'ggandor/lightspeed.nvim'
    Plug 'glacambre/firenvim', { 'do': { _ -> firenvim#install(0) } }
    call plug#end()
endif

if !exists('g:vscode')
    " Alt-z
    nnoremap ú :set wrap!<cr>
    inoremap ú <esc>:set wrap!<cr>gi
    inoremap jk <esc>
    inoremap <c-;> <esc>O
    nnoremap <c-k><c-l> :set nu!<cr>

    "  Commenting blocks of code.
    augroup commenting_blocks_of_code
        autocmd!
        autocmd FileType c,cpp,java,scala,rust let b:comment_leader = '// '
        autocmd FileType sh,ruby,python        let b:comment_leader = '# '
        autocmd FileType conf,fstab            let b:comment_leader = '# '
        autocmd FileType tex                   let b:comment_leader = '% '
        autocmd FileType mail                  let b:comment_leader = '> '
        autocmd FileType vim                   let b:comment_leader = '" '
        autocmd FileType ahk                   let b:comment_leader = '; '
    augroup END
    "  noremap gc :<C-B>silent <C-E>s/^/<C-R>=escape(b:comment_leader,'\/')<CR>/<CR>:nohlsearch<CR>
    "  noremap gC :<C-B>silent <C-E>s/^\V<C-R>=escape(b:comment_leader,'\/')<CR>//e<CR>:nohlsearch<CR>
endif

"  Firenvim
let g:timer_firenvim = ""
if exists('g:started_by_firenvim')
    inoremap {      {}<Left>
    inoremap <expr> }  strpart(getline('.'), col('.')-1, 1) == "}" ? "\<Right>" : "}"
    inoremap [      []<Left>
    inoremap <expr> ]  strpart(getline('.'), col('.')-1, 1) == "]" ? "\<Right>" : "]"
    inoremap ( ()<Left>
    inoremap <expr> )  strpart(getline('.'), col('.')-1, 1) == ")" ? "\<Right>" : ")"
    inoremap <expr> ' strpart(getline('.'), col('.')-1, 1) == "\'" ? "\<Right>" : "\'\'\<Left>"

    au BufEnter colab.*.txt set ft=python
    au BufEnter github.com_*.txt set ft=markdown

    let g:firenvim_config = { 
        \ 'localSettings': {
            \ '.*': {
                \ 'takeover': 'never',
                \ 'cmdline': 'firenvim',
            \ },
        \ }
    \ }

    " Throttled autoupdate text area
    let g:timer_started = v:false
    function! My_Write(timer) abort
        let g:timer_started = v:false
        write
    endfunction

    function! Delay_My_Write() abort
        if g:timer_started
            call timer_stop(g:timer_firenvim)
        end
        let g:timer_started = v:true
        echo g:timer_firenvim
        let g:timer_firenvim = timer_start(1000, 'My_Write')
    endfunction

    au TextChanged * ++nested call Delay_My_Write()
    au TextChangedI * ++nested call Delay_My_Write()
endif

nnoremap Y y$

nnoremap q i_<esc>r
nnoremap Q q
nnoremap g: Q

nnoremap ß <BS>?_<CR>:noh<CR><SPACE>
nnoremap ŭ /_<CR>:noh<CR><SPACE>
nnoremap é <SPACE>/_<CR>:noh<CR><BS>
nnoremap É <BS>?_<CR>:noh<CR><BS>

nnoremap <leader>z :noh<CR>

nnoremap <leader>w :w<CR>
nnoremap <leader>o mqo<ESC>k`q
nnoremap <leader>O mqO<ESC>j`q
nnoremap ó o<esc>cc
nnoremap Ó O<esc>cc

nnoremap <bs> ge
vnoremap <bs> ge
nnoremap <s-bs> gE
vnoremap <s-bs> gE

" Clipboard shortcuts
nnoremap <leader>x viw"*d
nnoremap <leader><leader>x viW"*d
vnoremap <leader>x "*d
nnoremap <leader><leader>d ggVG"_d
nnoremap <leader><leader>D ggVGd
vnoremap <leader><leader>d "*d
nnoremap <leader><leader>c ggVG"_c
nnoremap <leader><leader>C ggVGc
vnoremap <leader><leader>c "*c

nnoremap <leader>y "*y
vnoremap <leader>y "*y
nnoremap <leader><leader>y ggVG"*y

nnoremap <leader>v ggVG

nnoremap <leader>p "*p
xnoremap <leader>p "*p
nnoremap <leader>P "*P
xnoremap <leader>P "*P
nnoremap <leader><leader>p ggVG"*p

nnoremap dh dd
nnoremap dp ddp
nnoremap yp yyp
nnoremap cp yypk<CMD>call VSCodeNotify('editor.action.commentLine')<CR>j
vnoremap <leader>j yP`<

" Delete row content
nnoremap d<leader> 0"_D
nnoremap dc ^"_D
nnoremap dC ^_D
vnoremap <leader>x :s/^.*$<cr>

vnoremap x "_d

" Alternative in-wrapper modifiers
"*** :<cr> is a manual fix for the q marks to work well in VSCode.
"*** TODO: It would be worth it to check that bug.
"" word\s
nnoremap vie viwl
nnoremap yie mqviwly`q:<cr>
nnoremap die viwld
nnoremap cie viwlc
nnoremap viE viWl
nnoremap yiE mqviWly`q:<cr>
nnoremap diE viWld
nnoremap ciE viWlc
"" // Block
nnoremap di/ vip:g/^\s*\/\/.*$/d<cr>:noh<cr>
"" <text>
nnoremap vi, vi<
nnoremap va, va<
nnoremap yi, mqyi<`q:<cr>
nnoremap ya, mqya<`q:<cr>
nnoremap di, di<
nnoremap ci, ci<
nnoremap da, da<
nnoremap ca, ca<
nnoremap vu, va<V
nnoremap yu, mqva<Vy`q:noh<cr>
nnoremap du, va<Vd
nnoremap cu, va<Vc
"" ──><text>
nnoremap vi. /<<cr>vi<<esc>:noh<cr>gv
nnoremap va. /<<cr>va<<esc>:noh<cr>gv
nnoremap vu. /<<cr>va<V<esc>:noh<cr>gv
nnoremap yi. mq/<<cr>vi<y`q:noh<cr>
nnoremap ya. mq/<<cr>va<y`q:noh<cr>
nnoremap yu. mq/<<cr>va<Vy`q:noh<cr>
nnoremap di. mq/<<cr>vi<d`q:noh<cr>
nnoremap da. mq/<<cr>va<d`q:noh<cr>
nnoremap du. mq/<<cr>va<Vd`q:noh<cr>
nnoremap ci. /<<cr>vi<<esc>:noh<cr>gvc
nnoremap ca. /<<cr>va<<esc>:noh<cr>gvc
nnoremap cu. /<<cr>va<V<esc>:noh<cr>gvc
"" 'text'
nnoremap vu' vi'V
nnoremap yu' mqvi'Vy`q:noh<cr>
nnoremap du' mqvi'Vd`q:noh<cr>
nnoremap cu' vi'Vc
"" ──>'text'
nnoremap vi" /'<cr>vi'<esc>:noh<cr>gv
nnoremap va" /'<cr>va'<esc>:noh<cr>gv
nnoremap vu" /'<cr>va'V<esc>:noh<cr>gv
nnoremap yi" mq/'<cr>vi'y`q:noh<cr>
nnoremap ya" mq/'<cr>va'y`q:noh<cr>
nnoremap yu" mq/'<cr>va'Vy`q:noh<cr>
nnoremap di" mq/'<cr>vi'd`q:noh<cr>
nnoremap da" mq/'<cr>va'd`q:noh<cr>
nnoremap du" mq/'<cr>va'Vd`q:noh<cr>
nnoremap ci" /'<cr>vi'<esc>:noh<cr>gvc
nnoremap ca" /'<cr>va'<esc>:noh<cr>gvc
nnoremap cu" /'<cr>va'V<esc>:noh<cr>gvc
"" "text"
nnoremap vi; vi"
nnoremap va; va"
nnoremap vu; va"V
nnoremap yi; mqyi"`q:<cr>
nnoremap ya; mqya"`q:<cr>
nnoremap yu; mqva"Vy`q:<cr>
nnoremap di; di"
nnoremap da; da"
nnoremap du; va"Vd
nnoremap ci; ci"
nnoremap ca; ca"
nnoremap cu; va"Vc
"" ──>"text"
nnoremap vi: /"<cr>vi"<esc>:noh<cr>gv
nnoremap va: /"<cr>va"<esc>:noh<cr>gv
nnoremap vu: /"<cr>va"V<esc>:noh<cr>gv
nnoremap yi: mq/"<cr>vi"y`q:noh<cr>
nnoremap ya: mq/"<cr>va"y`q:noh<cr>
nnoremap yu: mq/"<cr>va"Vy`q:noh<cr>
nnoremap di: mq/"<cr>vi"d`q:noh<cr>
nnoremap da: mq/"<cr>va"d`q:noh<cr>
nnoremap du: mq/"<cr>va"Vd`q:noh<cr>
nnoremap ci: /"<cr>vi"<esc>:noh<cr>gvc
nnoremap ca: /"<cr>va"<esc>:noh<cr>gvc
nnoremap cu: /"<cr>va"V<esc>:noh<cr>gvc
"" (text)
nnoremap viu vi(
nnoremap vau va(
nnoremap vuu va(V
nnoremap yiu mqyi(`q:<cr>
nnoremap yau mqya(`q:<cr>
nnoremap yuu mqva(Vy`q:<cr>
nnoremap diu di(
nnoremap dau da(
nnoremap duu va(Vd
nnoremap ciu ci(
nnoremap cau ca(
nnoremap cuu va(Vc
"" ──>(text)
nnoremap vii /(<cr>vi(<esc>:noh<cr>gv
nnoremap vai /(<cr>va(<esc>:noh<cr>gv
nnoremap vui /(<cr>va(V<esc>:noh<cr>gv
nnoremap yii mq/(<cr>vi(y`q:noh<cr>
nnoremap yai mq/(<cr>va(y`q:noh<cr>
nnoremap yui mq/(<cr>va(Vy`q:noh<cr>
nnoremap dii mq/(<cr>vi(d`q:noh<cr>
nnoremap dai mq/(<cr>va(d`q:noh<cr>
nnoremap dui mq/(<cr>va(Vd`q:noh<cr>
nnoremap cii /(<cr>vi(<esc>:noh<cr>gvc
nnoremap cai /(<cr>va(<esc>:noh<cr>gvc
nnoremap cui /(<cr>va(V<esc>:noh<cr>gvc
"" [text]
nnoremap vi[ vi[
nnoremap va[ va[
nnoremap vu[ va[V
nnoremap yi[ mqyi[`q:<cr>
nnoremap ya[ mqya[`q:<cr>
nnoremap yu[ mqva[Vy`q:<cr>
nnoremap di[ di[
nnoremap da[ da[
nnoremap du[ va[Vd
nnoremap ci[ ci[
nnoremap ca[ ca[
nnoremap cu[ va[Vc
"" ──>[text]
nnoremap vi] /[<cr>vi[<esc>:noh<cr>gv
nnoremap va] /[<cr>va[<esc>:noh<cr>gv
nnoremap vu] /[<cr>va[V<esc>:noh<cr>gv
nnoremap yi] mq/[<cr>vi[y`q:noh<cr>
nnoremap ya] mq/[<cr>va[y`q:noh<cr>
nnoremap yu] mq/[<cr>va[Vy`q:noh<cr>
nnoremap di] mq/[<cr>vi[d`q:noh<cr>
nnoremap da] mq/[<cr>va[d`q:noh<cr>
nnoremap du] mq/[<cr>va[Vd`q:noh<cr>
nnoremap ci] /[<cr>vi[<esc>:noh<cr>gvc
nnoremap ca] /[<cr>va[<esc>:noh<cr>gvc
nnoremap cu] /[<cr>va[V<esc>:noh<cr>gvc
"" {text}
nnoremap vij vi{
nnoremap vaj va{
nnoremap vuj va{V
nnoremap yij mqyi{`q:<cr>
nnoremap yaj mqya{`q:<cr>
nnoremap yuj mqva{Vy`q:<cr>
nnoremap dij di{
nnoremap daj da{
nnoremap duj va{Vd
nnoremap cij ci{
nnoremap caj ca{
nnoremap cuj va{Vc
""  ──>{text}
nnoremap vik /{<cr>vi{<esc>:noh<cr>gv
nnoremap vak /{<cr>va{<esc>:noh<cr>gv
nnoremap vuk /{<cr>va{V<esc>:noh<cr>gv
nnoremap yik mq/{<cr>vi{y`q:noh<cr>
nnoremap yak mq/{<cr>va{y`q:noh<cr>
nnoremap yuk mq/{<cr>va{Vy`q:noh<cr>
nnoremap dik mq/{<cr>vi{d`q:noh<cr>
nnoremap dak mq/{<cr>va{d`q:noh<cr>
nnoremap duk mq/{<cr>va{Vd`q:noh<cr>
nnoremap cik /{<cr>vi{<esc>:noh<cr>gvc
nnoremap cak /{<cr>va{<esc>:noh<cr>gvc
nnoremap cuk /{<cr>va{V<esc>:noh<cr>gvc
"" ${text}
nnoremap vaf va{oho
nnoremap vuf va{V
nnoremap yaf mqva{ohy`q:<cr>
nnoremap yuf mqva{Vy`q:<cr>
nnoremap dif di{
nnoremap daf va{ohd
nnoremap duf va{Vd
nnoremap cif ci{
nnoremap caf va{ohc
nnoremap cuf va{Vc
""  ──>${text}
nnoremap viF /{<cr>vi{<esc>:noh<cr>gv
nnoremap vaF /{<cr>va{oho<esc>:noh<cr>gv
nnoremap vuF /{<cr>va{V<esc>:noh<cr>gv
nnoremap yiF mq/{<cr>vi{y`q:noh<cr>
nnoremap yaF mq/{<cr>va{ohy`q:noh<cr>
nnoremap yuF mq/{<cr>va{Vy`q:noh<cr>
nnoremap diF mq/{<cr>vi{d`q:noh<cr>
nnoremap daF mq/{<cr>va{ohd`q:noh<cr>
nnoremap duF mq/{<cr>va{Vd`q:noh<cr>
nnoremap ciF /{<cr>vi{<esc>:noh<cr>gvc
nnoremap caF /{<cr>va{oh<esc>:noh<cr>gvc
nnoremap cuF /{<cr>va{V<esc>:noh<cr>gvc
"" %text%
nnoremap vig t%vT%
nnoremap vag f%vF%
nnoremap yig mqt%yT%`q:<cr>
nnoremap yag mqf%yF%`q:<cr>
nnoremap dig t%vT%d
nnoremap dag f%vF%d
nnoremap cig t%vT%c
nnoremap cag f%vF%c
"" ──>%text%
nnoremap viG /%<cr>t%vT%<esc>:noh<cr>gv
nnoremap vaG /%<cr>vf%<esc>:noh<cr>gv
nnoremap yiG mq/%<cr>t%yT%`q:noh<cr>
nnoremap yaG mq/%<cr>yf%`q:noh<cr>
nnoremap diG mq/%<cr>f%dT%`q:noh<cr>
nnoremap daG mq/%<cr>df%`q:noh<cr>
nnoremap ciG /%<cr>t%vT%<esc>:noh<cr>gvc
nnoremap caG /%<cr>vf%<esc>:noh<cr>gvc

nnoremap <leader>t< va<ovd^va<vd$A><esc>

" « WRAPPERS »
" ┌──➤ 'Text'
nnoremap <leader>i' <Plug>QuoteWordWrap
nnoremap <Plug>QuoteWordWrap mqviw<ESC>a'<ESC>bi'<ESC>`q
    \:call repeat#set("\<Plug>QuoteWordWrap")<CR>

nnoremap <leader><leader>i' <Plug>QuoteWORDWrap
nnoremap <Plug>QuoteWORDWrap mqviW<ESC>a'<ESC>Bi'<ESC>`q
    \:call repeat#set("\<Plug>QuoteWORDWrap")<CR>

vnoremap <leader>i' <ESC>mq`>a'<ESC>`<<ESC>i'<ESC>`><ESC>`q

nnoremap <leader>d' <Plug>QuoteUnwrap
nnoremap <Plug>QuoteUnwrap mq/'<cr>x?'<cr>x:noh<cr>`q
    \:call repeat#set("\<Plug>QuoteUnwrap")<CR>

nnoremap <leader>d" <Plug>NextQuoteUnwrap
nnoremap <Plug>NextQuoteUnwrap mq/'<cr>x/'<cr>x:noh<cr>`q
    \:call repeat#set("\<Plug>NextQuoteUnwrap")<CR>

vnoremap <leader>d' <esc>mq`>/'<cr>x`<?'<cr>x:noh<cr>`q

" ┌──➤ "Text"
nnoremap <leader>i; <Plug>DQuoteWordWrap
nnoremap <Plug>DQuoteWordWrap mqviw<ESC>a"<ESC>bi"<ESC>`q
    \:call repeat#set("\<Plug>DQuoteWordWrap")<CR>

nnoremap <leader><leader>i; <Plug>DQuoteWORDWrap
nnoremap <Plug>DQuoteWORDWrap mqviW<ESC>a"<ESC>Bi"<ESC>`q
    \:call repeat#set("\<Plug>DQuoteWORDWrap")<CR>

vnoremap <leader>i; <ESC>mq`>a"<ESC>`<<ESC>i"<ESC>`><ESC>`q

nnoremap <leader>d; <Plug>DQuoteUnwrap
nnoremap <Plug>DQuoteUnwrap mq/"<cr>x?"<cr>x:noh<cr>`q
    \:call repeat#set("\<Plug>DQuoteUnwrap")<CR>

nnoremap <leader>d: <Plug>NextDQuoteUnwrap
nnoremap <Plug>NextDQuoteUnwrap mq/"<cr>x/"<cr>x:noh<cr>`q
    \:call repeat#set("\<Plug>NextDQuoteUnwrap")<CR>

vnoremap <leader>d; <esc>mq`>/"<cr>x`<?"<cr>x:noh<cr>`q

" ┌──➤ `Text`
nnoremap <leader>i` <Plug>BTickWordWrap
nnoremap <Plug>BTickWordWrap mqviw<ESC>a`<ESC>bi`<ESC>`q
    \:call repeat#set("\<Plug>BTickWordWrap")<CR>

nnoremap <leader><leader>i` <Plug>BTickWORDWrap
nnoremap <Plug>BTickWORDWrap mqviW<ESC>a`<ESC>Bi`<ESC>`q
    \:call repeat#set("\<Plug>BTickWORDWrap")<CR>

vnoremap <leader>i` <ESC>mq`>a`<ESC>`<<ESC>i`<ESC>`><ESC>`q

nnoremap <leader>d` <Plug>BTickUnwrap
nnoremap <Plug>BTickUnwrap mq/`<cr>x?`<cr>x:noh<cr>`q
    \:call repeat#set("\<Plug>BTickUnwrap")<CR>

nnoremap <leader>d~ <Plug>NextBTickUnwrap
nnoremap <Plug>NextBTickUnwrap mq/`<cr>x/`<cr>x:noh<cr>`q
    \:call repeat#set("\<Plug>NextBTickUnwrap")<CR>

vnoremap <leader>d` <esc>mq`>/`<cr>x`<?`<cr>x:noh<cr>`q

" ┌──➤ %Text%
nnoremap <leader>ig <Plug>AHKVarWordWrap
nnoremap <Plug>AHKVarWordWrap mqviw<ESC>a%<ESC>bi%<ESC>`q
    \:call repeat#set("\<Plug>AHKVarWordWrap")<CR>

nnoremap <leader><leader>ig <Plug>AHKVarWORDWrap
nnoremap <Plug>AHKVarWORDWrap mqviW<ESC>a%<ESC>Bi%<ESC>`q
    \:call repeat#set("\<Plug>AHKVarWORDWrap")<CR>

vnoremap <leader>ig <ESC>mq`>a%<ESC>`<<ESC>i%<ESC>`><ESC>`q

nnoremap <leader>dg <Plug>AHKVarUnwrap
nnoremap <Plug>AHKVarUnwrap mq/%<cr>x?%<cr>x:noh<cr>`q
    \:call repeat#set("\<Plug>AHKVarUnwrap")<CR>

nnoremap <leader>dG <Plug>NextAHKVarUnwrap
nnoremap <Plug>NextAHKVarUnwrap mq/%<cr>x/%<cr>x:noh<cr>`q
    \:call repeat#set("\<Plug>NextAHKVarUnwrap")<CR>

vnoremap <leader>dg <esc>mq`>/%<cr>x`<?%<cr>x:noh<cr>`q

" ┌──➤ (Text)
nnoremap <leader>iu <Plug>ParensWordWrap
nnoremap <Plug>ParensWordWrap mqviw<ESC>a)<ESC>bi(<ESC>`q
    \:call repeat#set("\<Plug>ParensWordWrap")<CR>

nnoremap <leader><leader>iu <Plug>ParensWORDWrap 
nnoremap <Plug>ParensWORDWrap mqviW<ESC>a)<ESC>Bi(<ESC>`q
    \:call repeat#set("\<Plug>ParensWORDWrap")<CR>

vnoremap <leader>iu <ESC>mq`>a)<ESC>`<<ESC>i(<ESC>`><ESC>`q

nnoremap <leader>du <Plug>ParensUnwrap
nnoremap <Plug>ParensUnwrap mqva(o<esc>%x``x`q
    \:call repeat#set("\<Plug>ParensUnwrap")<CR>

nnoremap <leader>di <Plug>NextParensUnwrap
nnoremap <Plug>NextParensUnwrap mq/(<cr>va(o<esc>%x``x:noh<cr>`q
    \:call repeat#set("\<Plug>NextParensUnwrap")<CR>

vnoremap <leader>du <esc>mq`>/)<cr>x`<?(<cr>x:noh<cr>`q

nnoremap <leader>ru <Plug>ToParensWrap
nnoremap <Plug>ToParensWrap mq/[)\]}]<cr>%r(``r):noh<cr>`q
    \:call repeat#set("\<Plug>ToParensWrap")<CR>

nnoremap <leader>ri <Plug>NextToParensWrap
nnoremap <Plug>NextToParensWrap mq/[)\]}]<cr>n%r(``r):noh<cr>`q
    \:call repeat#set("\<Plug>NextToParensWrap")<CR>

nnoremap <leader><CR>u <Plug>OutlineWordParensWrap
nnoremap <Plug>OutlineWordParensWrap mqviw<ESC>a<CR>)<CR><ESC>`<i<CR>(<CR><ESC>`q
    \:call repeat#set("\<Plug>OutlineWordParensWrap")<CR>

vnoremap <leader><CR>u <ESC>mq`>a<CR>)<ESC>`<i(<CR><ESC>`q

nnoremap <leader><CR>i <Plug>OutlineParensWrap
nnoremap <Plug>OutlineParensWrap mqO(<ESC>jo)<ESC>`q>>
    \:call repeat#set("\<Plug>OutlineParensWrap")<CR>

vnoremap <leader><CR>i <ESC>mq`<O(<ESC>`>o)<ESC>gv><ESC>`q

" ┌──➤ [Text]
nnoremap <leader>i[ <Plug>BracketsWordWrap
nnoremap <Plug>BracketsWordWrap mqviw<ESC>a]<ESC>bi[<ESC>`q
    \:call repeat#set("\<Plug>BracketsWordWrap")<CR>

nnoremap <leader><leader>i[ <Plug>BracketsWORDWrap
nnoremap <Plug>BracketsWORDWrap mqviW<ESC>a]<ESC>Bi[<ESC>`q
    \:call repeat#set("\<Plug>BracketsWORDWrap")<CR>

vnoremap <leader>i[ <ESC>mq`>a]<ESC>`<<ESC>i[<ESC>`><ESC>`q

nnoremap <leader>d[ <Plug>BracketsUnwrap
nnoremap <Plug>BracketsUnwrap mqva[o<esc>%x``x`q
    \:call repeat#set("\<Plug>BracketsUnwrap")<CR>

nnoremap <leader>d] <Plug>NextBracketsUnwrap
nnoremap <Plug>NextBracketsUnwrap mq/[<cr>va[o<esc>%x``x:noh<cr>`q
    \:call repeat#set("\<Plug>NextBracketsUnwrap")<CR>

vnoremap <leader>d[ <esc>mq`>/]<cr>x`<?[<cr>x:noh<cr>`q

nnoremap <leader>r[ <Plug>ToBracketsWrap
nnoremap <Plug>ToBracketsWrap mq/[)}]<cr>%r[``r]:noh<cr>`q
    \:call repeat#set("\<Plug>ToBracketsWrap")<CR>

nnoremap <leader>r] <Plug>NextToBracketsWrap
nnoremap <Plug>NextToBracketsWrap mq/[)}]<cr>n%r[``r]:noh<cr>`q
    \:call repeat#set("\<Plug>NextToBracketsWrap")<CR>

nnoremap <leader><CR>[ <Plug>OutlineWordBracketsWrap
nnoremap <Plug>OutlineWordBracketsWrap mqviw<ESC>a<CR>]<CR><ESC>`<i<CR>[<CR><ESC>`q
    \:call repeat#set("\<Plug>OutlineWordBracketsWrap")<CR>

vnoremap <leader><CR>[ <ESC>mq`>a<CR>]<ESC>`<i[<CR><ESC>`q

nnoremap <leader><CR>] <Plug>OutlineBracketsWrap
nnoremap <Plug>OutlineBracketsWrap mqO[<ESC>jo]<ESC>`q>>
    \:call repeat#set("\<Plug>OutlineBracketsWrap")<CR>

vnoremap <leader><CR>] <ESC>mq`<O[<ESC>`>o]<ESC>gv><ESC>`q

" ┌──➤ {Text}
nnoremap <leader>ij <Plug>BracesWordWrap
nnoremap <Plug>BracesWordWrap mqviw<ESC>a}<ESC>bi{<ESC>`q
    \:call repeat#set("\<Plug>BracesWordWrap")<CR>

nnoremap <leader><leader>ij <Plug>BracesWORDWrap
nnoremap <Plug>BracesWORDWrap mqviW<ESC>a}<ESC>Bi{<ESC>`q
    \:call repeat#set("\<Plug>BracesWORDWrap")<CR>

vnoremap <leader>ij <ESC>mq`>a}<ESC>`<<ESC>i{<ESC>`><ESC>`q

nnoremap <leader>dj <Plug>BracesUnwrap
nnoremap <Plug>BracesUnwrap mqva{o<esc>%x``x`q
    \:call repeat#set("\<Plug>BracesUnwrap")<CR>

nnoremap <leader>dk <Plug>NextBracesUnwrap
nnoremap <Plug>NextBracesUnwrap mq/{<cr>va{o<esc>%x``x:noh<cr>`q
    \:call repeat#set("\<Plug>NextBracesUnwrap")<CR>

vnoremap <leader>dj <esc>mq`>/}<cr>x`<?{<cr>x:noh<cr>`q

nnoremap <leader>rj <Plug>ToBracesWrap
nnoremap <Plug>ToBracesWrap mq/[)\]]<cr>%r{``r}:noh<cr>`q
    \:call repeat#set("\<Plug>ToBracesWrap")<CR>

nnoremap <leader>rk <Plug>NextToBracesWrap
nnoremap <Plug>NextToBracesWrap mq/[)\]]<cr>n%r{``r}:noh<cr>`q
    \:call repeat#set("\<Plug>NextToBracesWrap")<CR>

nnoremap <leader><CR>j <Plug>OutlineWordBracesWrap
nnoremap <Plug>OutlineWordBracesWrap mqviw<ESC>a<CR>}<CR><ESC>`<i<CR>{<CR><ESC>`q
    \:call repeat#set("\<Plug>OutlineWordBracesWrap")<CR>

vnoremap <leader><CR>j <ESC>mq`<O{<ESC>`>o}<ESC>gv><ESC>`q

nnoremap <leader><CR>k <Plug>OutlineBracesWrap
nnoremap <Plug>OutlineBracesWrap mqO{<ESC>jo}<ESC>`q>>
    \:call repeat#set("\<Plug>OutlineBracesWrap")<CR>

vnoremap <leader><CR>k <ESC>mq`<O{<ESC>`>o}<ESC>gv><ESC>`q

" ┌──➤ { Text }
nnoremap <leader>iJ <Plug>SBracesWordWrap
nnoremap <Plug>SBracesWordWrap mqviw<ESC>a }<ESC>bi{ <ESC>`q
    \:call repeat#set("\<Plug>SBracesWordWrap")<CR>

nnoremap <leader><leader>iJ <Plug>SBracesWORDWrap
nnoremap <Plug>SBracesWORDWrap mqviW<ESC>a }<ESC>Bi{ <ESC>`q
    \:call repeat#set("\<Plug>SBracesWORDWrap")<CR>

vnoremap <leader>iJ <ESC>mq`>a }<ESC>`<<ESC>i{ <ESC>`><ESC>`q

nnoremap <leader>dJ <Plug>SBracesUnwrap
nnoremap <Plug>SBracesUnwrap mqva{o<esc>%hxx``xx`q
    \:call repeat#set("\<Plug>SBracesUnwrap")<CR>

nnoremap <leader>dK <Plug>NextSBracesUnwrap
nnoremap <Plug>NextSBracesUnwrap mq/{<cr>va{o<esc>%hxx``xx:noh<cr>`q
    \:call repeat#set("\<Plug>NextSBracesUnwrap")<CR>

vnoremap <leader>dJ <esc>mq`>/}<cr>hxx`<?<cr>xx:noh<cr>`q

" ┌──➤ ${Text}
nnoremap <leader>if <Plug>PlaceholderWordWrap
nnoremap <Plug>PlaceholderWordWrap mqviw<ESC>a}<ESC>bi${<ESC>`q
    \:call repeat#set("\<Plug>PlaceholderWordWrap")<CR>

nnoremap <leader><leader>if <Plug>PlaceholderWORDWrap
nnoremap <Plug>PlaceholderWORDWrap mqviW<ESC>a}<ESC>Bi${<ESC>`q
    \:call repeat#set("\<Plug>PlaceholderWORDWrap")<CR>

vnoremap <leader>if <ESC>mq`>a}<ESC>`<<ESC>i${<ESC>`><ESC>`q

nnoremap <leader>df <Plug>PlaceholderUnwrap
nnoremap <Plug>PlaceholderUnwrap mqva{o<esc>%x``xX:noh<cr>`q
    \:call repeat#set("\<Plug>PlaceholderUnwrap")<CR>

nnoremap <leader>dF <Plug>NextPlaceholderUnwrap
nnoremap <Plug>NextPlaceholderUnwrap mq/{<cr>va{o<esc>%x``xX:noh<cr>`q
    \:call repeat#set("\<Plug>NextPlaceholderUnwrap")<CR>

vnoremap <leader>df <esc>mq`>/}<cr>x`<?$<cr>xx:noh<cr>`q

nnoremap <leader><CR>f <Plug>OutlinePlaceholderWrap
nnoremap <Plug>OutlinePlaceholderWrap mqO${<ESC>jo}<ESC>`q>>
    \:call repeat#set("\<Plug>OutlinePlaceholderWrap")<CR>

vnoremap <leader><CR>f <ESC>mq`>a<CR>}<ESC>`<i${<CR><ESC>gv><ESC>`q

" ┌──➤ /Text/
nnoremap <leader>i/ <Plug>SlashWordWrap
nnoremap <Plug>SlashWordWrap mqviw<ESC>a/<ESC>bi/<ESC>`q
    \:call repeat#set("\<Plug>SlashWordWrap")<CR>

nnoremap <leader><leader>i/ <Plug>SlashWORDWrap
nnoremap <Plug>SlashWORDWrap mqviW<ESC>a/<ESC>Bi/<ESC>`q
    \:call repeat#set("\<Plug>SlashWORDWrap")<CR>

vnoremap <leader>i/ <ESC>mq`>a/<ESC>`<<ESC>i/<ESC>`><ESC>`q

nnoremap <leader>d/ <Plug>SlashUnwrap
nnoremap <Plug>SlashUnwrap mq//<cr>x?/<cr>x:noh<cr>`q
    \:call repeat#set("\<Plug>SlashUnwrap")<CR>

nnoremap <leader>d? <Plug>NextSlashUnwrap
nnoremap <Plug>NextSlashUnwrap mq//<cr>nx?/<cr>x:noh<cr>`q
    \:call repeat#set("\<Plug>NextSlashUnwrap")<CR>

vnoremap <leader>d/ <esc>mq`>//<cr>x`<?/<cr>x:noh<cr>`q

" ┌──➤ <Text>
nnoremap <leader>i, <Plug>ChevronsWordWrap
nnoremap <Plug>ChevronsWordWrap mqviw<ESC>a><ESC>bi<<ESC>`q
    \:call repeat#set("\<Plug>ChevronsWordWrap")<CR>

nnoremap <leader><leader>i, <Plug>ChevronsWORDWrap
nnoremap <Plug>ChevronsWORDWrap mqviW<ESC>a><ESC>Bi<<ESC>`q
    \:call repeat#set("\<Plug>ChevronsWORDWrap")<CR>

vnoremap <leader>i, <ESC>mq`>a><ESC>`<<ESC>i<<ESC>`><ESC>`q

nnoremap <leader>d, <Plug>ChevronsUnwrap
nnoremap <Plug>ChevronsUnwrap mqva<o<esc>va<<esc>x``x:noh<cr>`q
    \:call repeat#set("\<Plug>ChevronsUnwrap")<CR>

nnoremap <leader>d. <Plug>NextChevronsUnwrap
nnoremap <Plug>NextChevronsUnwrap mq/<<cr>va<o<esc>va<<esc>x``x:noh<cr>`q
    \:call repeat#set("\<Plug>NextChevronsUnwrap")<CR>

vnoremap <leader>d, <esc>mq`>/><cr>x`<?<<cr>x:noh<cr>`q

" ┌──➤  Text 
nnoremap <leader>i<leader> <Plug>SpaceWordWrap
nnoremap <Plug>SpaceWordWrap mqviw<ESC>a <ESC>bi <ESC>`q
    \:call repeat#set("\<Plug>SpaceWordWrap")<CR>

nnoremap <leader><leader>i<leader> <Plug>SpaceWORDWrap
nnoremap <Plug>SpaceWORDWrap mqviw<esc>a <esc>bi <esc>`q
    \:call repeat#set("\<Plug>SpaceWORDWrap")<CR>

vnoremap <leader>i<leader> <ESC>mq`>a <ESC>`<<ESC>i <ESC>`><ESC>`q

nnoremap <leader>d<leader> <Plug>SpaceUnwrap
nnoremap <Plug>SpaceUnwrap mq/ <cr>x? <cr>x:noh<cr>`q
    \:call repeat#set("\<Plug>SpaceUnwrap")<CR>

vnoremap <leader>d<leader> <esc>mq`>/ <cr>x`<? <cr>x:noh<cr>`q

" ┌──➤  \n
"    Text
"\n
nnoremap <leader>i<CR> <Plug>NewlineWordWrap
nnoremap <Plug>NewlineWordWrap viw<ESC>a<CR><ESC>`<i<CR><ESC>
    \:call repeat#set("\<Plug>NewlineWordWrap")<CR>

nnoremap <leader><leader>i<CR> <Plug>NewlineWORDWrap
nnoremap <Plug>NewlineWORDWrap viW<ESC>a<CR><ESC>`<i<CR><ESC>
    \:call repeat#set("\<Plug>NewlineWORDWrap")<CR>

vnoremap <leader>i<CR> <ESC>`>a<CR><ESC>`<i<CR><ESC>

" ┌──➤  <>Text</>
nnoremap <leader>it o</><ESC>kO<><ESC>mqj>>`qi
vnoremap <leader>it <ESC>`>o</><ESC>`<O<><ESC>mqgv>`qi
nnoremap <leader>dt mqvat<`q0i:exe "/^<esc>f<a\\/<esc>/[ >]<cr>i" <esc>"qdF::@q<cr>dd`qdd:noh<cr>
"""" Note: Your cursor has to be (anywhere) on top of the opening tag and it only works with spreaded tags (not oneliners) in the form:
    " <tag (optional attributes)>
    "   (optional content)
"""" </tag>

nnoremap <leader>; mq$a;<ESC>`q
nnoremap <leader>, mq$a,<ESC>`q
nnoremap <leader>. mq$a.<ESC>`q

nnoremap <leader>l $
nnoremap <leader>h ^
nnoremap <leader>H 0

" Change inside parens/brackets shortcut [EXPERIMENTAL]
"  onoremap p :<c-u>normal! t)vi(<cr>
"  onoremap P :<c-u>normal! T(vi(<cr>
"  onoremap o :<c-u>normal! t]vi[<cr>
"  onoremap O :<c-u>normal! T[vi[<cr>

nnoremap <C-a> v<C-a>
nnoremap <C-x> v<C-x>

nnoremap { /^\s*$<cr>:noh<cr>
nnoremap } ?^\s*$<cr>:noh<cr>
onoremap { }
onoremap } {
vnoremap { }
vnoremap } {
nnoremap ) /[)}\]]<cr>:noh<cr>
nnoremap ( ?[({[]<cr>:noh<cr>
vnoremap ) /[)}\]]<cr>
vnoremap ( ?[({[]<cr>

" Don't replace register when pasting in visual + give alternative
vnoremap p "_c<c-r>"<esc>
vnoremap P p

" Format into multiple lines <EXPERIMENTAL>
nnoremap <leader>= vi(o<esc>i<cr><esc>vi(<esc>a<cr><esc>k:s/,\s\?/,\r/g<cr>:noh<cr>

" Add Markdown checklist to lines
nnoremap <leader>ix mqI - [ ] <esc>`q:noh<cr>
nnoremap <leader>dx mq:s/ - \[.\] <cr>`q:noh<cr>
vnoremap <leader>ix <esc>mqgv^o^<c-v>I - [ ] <esc>`q:noh<cr>
vnoremap <leader>dx <esc>mqgv:s/ - \[.\] <cr>`q:noh<cr>

" Toggle capitalization of first letter of word
nnoremap <leader>~ mqviwo<esc>~`q

" Calculate written operation (doesn't work in VSCode)
vnoremap <localleader>c s<c-r>=<c-r>"<cr><esc>

" Wrap with console print function

" Source or edit config file
nnoremap <localleader><localleader>s :source C:\Users\Moiso\rc\vim_init.vim<cr>
nnoremap <localleader><localleader>e :e C:\Users\Moiso\rc\vim_init.vim<cr>


" ====================== VSCode only begin ===================

" VSCode needs double backlash (\\) for the OR operator for some unkown reason...
nnoremap dix /,\\|)\\|}\\|]\\|\s}<cr>d?,<cr>:noh<cr>
nnoremap diX mq/,<cr>lv`q?(\\|\[\\|{<cr>wd:noh<cr>
nnoremap cix /,\\|)\\|}\\|]\\|\s}<cr>hv?,<cr>wv:noh<cr>gvc
nnoremap ciX mq/,<cr>lv`q?(\\|\[\\|{<cr>v:noh<cr>gvwc

" ===================== VSCode only end =======================


" ============================ TESTS =================================

"augroup test_js
"	au!
"	au FileType javascript nnoremap <buffer> <localleader>c iasdfjkl;<ESC>
"augroup END

nnoremap <localleader><localleader>p :call InsertPrintFunction("w")<cr>

function! InsertPrintFunction(x)
    let extension = expand('%:e')

    " Python
    if extension =~# "py"
        exec "normal! vi" . a:x . "\<ESC>a)\<ESC>biprint(\<ESC>%"

    " Javascript
    elseif extension =~# "^js" || "^ts"
        exec "normal! vi" . a:x . "\<ESC>a)\<ESC>biconsole.log(\<ESC>%"

    " Rust
    elseif extension ==# "rs"
        exec "normal! vi" . a:x . "\<ESC>a)\<ESC>biprintln!(\"{}\", \<ESC>f)"
    else
        echo "###   « Mi ne rekonas ĉi tiun dosiertipon... »   ###"
    endif
endfunction

function! EnumSubtitleLines()
    let line = 1
    
    while line < 5000
        try
            exec "normal! /^$\<CR>"
        catch /.*/
            break
        endtry
        exec "normal! s" . line . "\<ESC>"
        let line += 1
    endwhile
    
    " Add newline before the added numbers
    exec "normal! :%s/^\\(\\d*\\)$/\\r\\1/g\<CR>:noh\<CR>"
    echo "Linioj nombritaj :)"
endfunction
