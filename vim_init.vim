set encoding=utf-8
set fileencoding=utf-8
set shortmess=filnxtToOI
set guifont=Consola:h10
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
nnoremap yY ggVGy

nnoremap q i_<esc>r
nnoremap Q q
nnoremap g: Q

nnoremap <leader>z :noh<CR>

nnoremap <leader>w :w<CR>
nnoremap <leader>o mqo<ESC>k`q
nnoremap <leader>O mqO<ESC>j`q
nnoremap ó o<esc>cc
nnoremap Ó O<esc>cc

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

nnoremap <leader>yy "*yy
nnoremap <leader>Y "*y$
nnoremap <leader>yw "*yw
nnoremap <leader>yW "*yW
nnoremap <leader>yiw "*yiw
nnoremap <leader>yiW "*yiW
nnoremap <leader>ye "*ye
nnoremap <leader><leader>y ggVG"*y

vnoremap <leader>y "*y

nnoremap <leader>v ggVG

nnoremap <leader>p "*p
xnoremap <leader>p "*p
nnoremap <leader>P "*P
xnoremap <leader>P "*P
nnoremap <leader><leader>p ggVG"*p

" Delete row content
nnoremap d<leader> 0"_D
nnoremap dc ^"_D
nnoremap dC ^_D
vnoremap <leader>x :s/^.*$<cr>

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
nnoremap vu[ va[V
nnoremap yu[ mqva[Vy`q:<cr>
nnoremap du[ va[Vd
nnoremap cu[ va[Vc
"" ──>[text]
nnoremap vu] /[<cr>va[V<esc>:noh<cr>gv
nnoremap yu] mq/[<cr>va[Vy`q:noh<cr>
nnoremap du] mq/[<cr>va[Vd`q:noh<cr>
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
nnoremap <leader>i' mqviw<ESC>a'<ESC>bi'<ESC>`ql
nnoremap <leader><leader>i' mqviW<ESC>a'<ESC>Bi'<ESC>`ql
vnoremap <leader>i' <ESC>mq`>a'<ESC>`<<ESC>i'<ESC>`><ESC>`ql
nnoremap <leader>d' mq/'<cr>x?'<cr>x:noh<cr>`q
nnoremap <leader>d" mq/'<cr>x/'<cr>x:noh<cr>`q
vnoremap <leader>d' <esc>mq`>/'<cr>x`<?'<cr>x:noh<cr>`q
" ┌──➤ "Text"
nnoremap <leader>i; mqviw<ESC>a"<ESC>bi"<ESC>`ql
nnoremap <leader><leader>i; mqviW<ESC>a"<ESC>Bi"<ESC>`ql
vnoremap <leader>i; <ESC>mq`>a"<ESC>`<<ESC>i"<ESC>`><ESC>`ql
nnoremap <leader>d; mq/"<cr>x?"<cr>x:noh<cr>`q
nnoremap <leader>d: mq/"<cr>x/"<cr>x:noh<cr>`q
vnoremap <leader>d; <esc>mq`>/"<cr>x`<?"<cr>x:noh<cr>`q
" ┌──➤ `Text`
nnoremap <leader>i` mqviw<ESC>a`<ESC>bi`<ESC>`ql
nnoremap <leader><leader>i` mqviW<ESC>a`<ESC>Bi`<ESC>`ql
vnoremap <leader>i` <ESC>mq`>a`<ESC>`<<ESC>i`<ESC>`><ESC>`ql
nnoremap <leader>d` mq/`<cr>x?`<cr>x:noh<cr>`q
nnoremap <leader>d~ mq/`<cr>x/`<cr>x:noh<cr>`q
vnoremap <leader>d` <esc>mq`>/`<cr>x`<?`<cr>x:noh<cr>`q
" ┌──➤ ${Text}
nnoremap <leader>if mqviw<ESC>a}<ESC>bi${<ESC>`qll
nnoremap <leader><leader>if mqviW<ESC>a}<ESC>Bi${<ESC>`qll
vnoremap <leader>if <ESC>mq`>a}<ESC>`<<ESC>i${<ESC>`><ESC>`qll
nnoremap <leader>df mqva{o<esc>%x``xX:noh<cr>`q
nnoremap <leader>dF mq/{<cr>va{o<esc>%x``xX:noh<cr>`q
vnoremap <leader>df <esc>mq`>/}<cr>x`<?$<cr>xx:noh<cr>`q
" ┌──➤ %Text%
nnoremap <leader>ig mqviw<ESC>a%<ESC>bi%<ESC>`ql
nnoremap <leader><leader>ig mqviW<ESC>a%<ESC>Bi%<ESC>`ql
vnoremap <leader>ig <ESC>mq`>a%<ESC>`<<ESC>i%<ESC>`><ESC>`ql
nnoremap <leader>dg mq/%<cr>x?%<cr>x:noh<cr>`q
nnoremap <leader>dG mq/%<cr>x/%<cr>x:noh<cr>`q
vnoremap <leader>dg <esc>mq`>/%<cr>x`<?%<cr>x:noh<cr>`q
" ┌──➤ (Text)
nnoremap <leader>iu mqviw<ESC>a)<ESC>bi(<ESC>`ql
nnoremap <leader><leader>iu mqviW<ESC>a)<ESC>Bi(<ESC>`ql
vnoremap <leader>iu <ESC>mq`>a)<ESC>`<<ESC>i(<ESC>`><ESC>`ql
nnoremap <leader>du mqva(o<esc>%x``x`q
nnoremap <leader>di mq/(<cr>va(o<esc>%x``x:noh<cr>`q
vnoremap <leader>du <esc>mq`>/)<cr>x`<?(<cr>x:noh<cr>`q
" ┌──➤ [Text]
nnoremap <leader>i[ mqviw<ESC>a]<ESC>bi[<ESC>`ql
nnoremap <leader><leader>i[ mqviW<ESC>a]<ESC>Bi[<ESC>`ql
vnoremap <leader>i[ <ESC>mq`>a]<ESC>`<<ESC>i[<ESC>`><ESC>`ql
nnoremap <leader>d[ mqva[o<esc>%x``x`q
nnoremap <leader>d] mq/[<cr>va[o<esc>%x``x:noh<cr>`q
vnoremap <leader>d[ <esc>mq`>/]<cr>x`<?[<cr>x:noh<cr>`q
" ┌──➤ {Text}
nnoremap <leader>ij mqviw<ESC>a}<ESC>bi{<ESC>`ql
nnoremap <leader><leader>ij mqviW<ESC>a}<ESC>Bi{<ESC>`ql
vnoremap <leader>ij <ESC>mq`>a}<ESC>`<<ESC>i{<ESC>`><ESC>`ql
nnoremap <leader>dj mqva{o<esc>%x``x`q
nnoremap <leader>dk mq/{<cr>va{o<esc>%x``x:noh<cr>`q
vnoremap <leader>dj <esc>mq`>/}<cr>x`<?{<cr>x:noh<cr>`q
" ┌──➤ { Text }
nnoremap <leader>iJ mqviw<ESC>a }<ESC>bi{ <ESC>`ql
nnoremap <leader><leader>iJ mqviW<ESC>a }<ESC>Bi{ <ESC>`ql
vnoremap <leader>iJ <ESC>mq`>a }<ESC>`<<ESC>i{ <ESC>`><ESC>`ql
nnoremap <leader>dJ mqva{o<esc>%hxx``xx`q
nnoremap <leader>dK mq/{<cr>va{o<esc>%hxx``xx:noh<cr>`q
vnoremap <leader>dJ <esc>mq`>/}<cr>hxx`<?{<cr>xx:noh<cr>`q
" ┌──➤ /Text/
nnoremap <leader>i/ mqviw<ESC>a/<ESC>bi/<ESC>`ql
nnoremap <leader><leader>i/ mqviW<ESC>a/<ESC>Bi/<ESC>`ql
vnoremap <leader>i/ <ESC>mq`>a/<ESC>`<<ESC>i/<ESC>`><ESC>`ql
nnoremap <leader>d/ mq//<cr>x?/<cr>x:noh<cr>`q
nnoremap <leader>d? mq//<cr>nx?/<cr>x:noh<cr>`q
vnoremap <leader>d/ <esc>mq`>//<cr>x`<?/<cr>x:noh<cr>`q
" ┌──➤ <Text>
nnoremap <leader>i, mqviw<ESC>a><ESC>bi<<ESC>`ql
nnoremap <leader><leader>i, mqviW<ESC>a><ESC>Bi<<ESC>`ql
vnoremap <leader>i, <ESC>mq`>a><ESC>`<<ESC>i<<ESC>`><ESC>`ql
nnoremap <leader>d, mqva<o<esc>va<<esc>x``x:noh<cr>`q
nnoremap <leader>d. mq/<<cr>va<o<esc>va<<esc>x``x:noh<cr>`q
vnoremap <leader>d, <esc>mq`>/><cr>x`<?<<cr>x:noh<cr>`q
" ┌──➤  Text 
nnoremap <leader>i<leader> mqviw<ESC>a <ESC>bi <ESC>`ql
nnoremap <leader><leader>i<leader> mqviw<esc>a <esc>bi <esc>`ql
vnoremap <leader>i<leader> <ESC>mq`>a <ESC>`<<ESC>i <ESC>`><ESC>`ql
nnoremap <leader>d<leader> mq/ <cr>x? <cr>x:noh<cr>`q
vnoremap <leader>d<leader> <esc>mq`>/ <cr>x`<? <cr>x:noh<cr>`q
" ┌──➤  \n
"    Text
"\n
nnoremap <leader>i<CR> viw<ESC>a<CR><ESC>`<i<CR><ESC>
nnoremap <leader><leader>i<CR> viW<ESC>a<CR><ESC>`<i<CR><ESC>
vnoremap <leader>i<CR> <ESC>`>a<CR><ESC>`<i<CR><ESC>
    " Delete wrapper tags
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
onoremap p :<c-u>normal! t)vi(<cr>
onoremap P :<c-u>normal! T(vi(<cr>
onoremap o :<c-u>normal! t]vi[<cr>
onoremap O :<c-u>normal! T[vi[<cr>

nnoremap <C-a> v<C-a>
nnoremap <C-x> v<C-x>

nnoremap { /^\s*$<cr>:noh<cr>
nnoremap } ?^\s*$<cr>:noh<cr>
nnoremap ) /[)}\]]<cr>:noh<cr>
nnoremap ( ?[({[]<cr>:noh<cr>

" Don't replace register when pasting in visual + give alternative
vnoremap p "_dP
vnoremap P p

" Format into multiple lines
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
