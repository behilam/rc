set encoding=utf-8
set fileencoding=utf-8
set shortmess=filnxtToOI
let mapleader = ' '
let maplocalleader = '\'

if !exists('g:vscode')
    " Alt-z
    nnoremap ú :set wrap!<cr>
    inoremap ú <esc>:set wrap!<cr>gi
endif

nnoremap Y y$
nnoremap yY ggVGy

inoremap jk <esc>

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
nnoremap dc ^D
nnoremap ds ^"_D


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
"" ──><text>
nnoremap vi. /<<cr>vi<<esc>:noh<cr>gv
nnoremap va. /<<cr>va<<esc>:noh<cr>gv
nnoremap yi. mq/<<cr>vi<<esc>gvy`q:noh<cr>
nnoremap ya. mq/<<cr>va<<esc>gvy`q:noh<cr>
nnoremap di. mq/<<cr>vi<<esc>gvd`q:noh<cr>
nnoremap da. mq/<<cr>va<<esc>gvd`q:noh<cr>
nnoremap ci. /<<cr>vi<<esc>:noh<cr>gvc
nnoremap ca. /<<cr>va<<esc>:noh<cr>gvc
"" «text»
nnoremap di< /»<cr>hv?«<cr> d<esc>:noh<cr>
nnoremap da< /»<cr>v?«<cr>d<esc>:noh<cr>
nnoremap ci< /»<cr>hv?«<cr> d<esc>:noh<cr>i
nnoremap ca< /»<cr>v?«<cr>d<esc>:noh<cr>
"" ──>'text'
nnoremap vi" /'<cr>vi'<esc>:noh<cr>gv
nnoremap va" /'<cr>va'<esc>:noh<cr>gv
nnoremap yi" mq/'<cr>vi'<esc>gvy`q:noh<cr>
nnoremap ya" mq/'<cr>va'<esc>gvy`q:noh<cr>
nnoremap di" mq/'<cr>vi'<esc>gvd`q:noh<cr>
nnoremap da" mq/'<cr>va'<esc>gvd`q:noh<cr>
nnoremap ci" /'<cr>vi'<esc>:noh<cr>gvc
nnoremap ca" /'<cr>va'<esc>:noh<cr>gvc
"" "text"
nnoremap vi; vi"
nnoremap va; va"
nnoremap yi; mqyi"`q:<cr>
nnoremap ya; mqya"`q:<cr>
nnoremap di; di"
nnoremap da; da"
nnoremap ci; ci"
nnoremap ca; ca"
"" ──>"text"
nnoremap vi: /"<cr>vi"<esc>:noh<cr>gv
nnoremap va: /"<cr>va"<esc>:noh<cr>gv
nnoremap yi: mq/"<cr>vi"<esc>gvy`q:noh<cr>
nnoremap ya: mq/"<cr>va"<esc>gvy`q:noh<cr>
nnoremap di: mq/"<cr>vi"<esc>gvd`q:noh<cr>
nnoremap da: mq/"<cr>va"<esc>gvd`q:noh<cr>
nnoremap ci: /"<cr>vi"<esc>:noh<cr>gvc
nnoremap ca: /"<cr>va"<esc>:noh<cr>gvc
"" (text)
nnoremap viu vi(
nnoremap vau va(
nnoremap yiu mqyi(`q:<cr>
nnoremap yau mqya(`q:<cr>
nnoremap diu di(
nnoremap dau da(
nnoremap ciu ci(
nnoremap cau ca(
nnoremap duu va(Vd
nnoremap cuu va(Vc
"" ──>(text)
nnoremap vii /(<cr>vi(<esc>:noh<cr>gv
nnoremap vai /(<cr>va(<esc>:noh<cr>gv
nnoremap yii mq/(<cr>vi(<esc>gvy`q:noh<cr>
nnoremap yai mq/(<cr>va(<esc>gvy`q:noh<cr>
nnoremap dii mq/(<cr>vi(<esc>gvd`q:noh<cr>
nnoremap dai mq/(<cr>va(<esc>gvd`q:noh<cr>
nnoremap cii /(<cr>vi(<esc>:noh<cr>gvc
nnoremap cai /(<cr>va(<esc>:noh<cr>gvc
nnoremap dui mq/(<cr>va(V<esc>gvd`q:noh<cr>
nnoremap cui /(<cr>va(V<esc>:noh<cr>gvc
"" [text]
nnoremap vij vi[
nnoremap vaj va[
nnoremap yij yi[`q:<cr>
nnoremap yaj ya[`q:<cr>
nnoremap dij di[
nnoremap daj da[
nnoremap cij ci[
nnoremap caj ca[
nnoremap yuj mqva[Vy`q:<cr>
nnoremap duj va[Vd
nnoremap cuj va[Vc
"" ──>[text]
nnoremap vik /[<cr>vi[<esc>:noh<cr>gv
nnoremap vak /[<cr>va[<esc>:noh<cr>gv
nnoremap yik mq/[<cr>vi[<esc>gvy`q:noh<cr>
nnoremap yak mq/[<cr>va[<esc>gvy`q:noh<cr>
nnoremap dik mq/[<cr>vi[<esc>gvd`q:noh<cr>
nnoremap dak mq/[<cr>va[<esc>gvd`q:noh<cr>
nnoremap cik /[<cr>vi[<esc>:noh<cr>gvc
nnoremap cak /[<cr>va[<esc>:noh<cr>gvc
nnoremap duk mq/[<cr>va[V<esc>gvd`q:noh<cr>
nnoremap cuk /[<cr>va[V<esc>:noh<cr>gvc
"" {text}
nnoremap vin vi{
nnoremap van va{
nnoremap yin mqyi{`q:<cr>
nnoremap yan mqya{`q:<cr>
nnoremap din di{
nnoremap dan da{
nnoremap cin ci{
nnoremap can ca{
nnoremap dun va{Vd
nnoremap cun va{Vc
""  ──>{text}
nnoremap vim /{<cr>vi{<esc>:noh<cr>gv
nnoremap vam /{<cr>va{<esc>:noh<cr>gv
nnoremap yim mq/{<cr>vi{<esc>gvy`q:noh<cr>
nnoremap yam mq/{<cr>va{<esc>gvy`q:noh<cr>
nnoremap dim mq/{<cr>vi{<esc>gvd`q:noh<cr>
nnoremap dam mq/{<cr>va{<esc>gvd`q:noh<cr>
nnoremap cim /{<cr>vi{<esc>:noh<cr>gvc
nnoremap cam /{<cr>va{<esc>:noh<cr>gvc
nnoremap dum mq/{<cr>va{V<esc>gvd`q:noh<cr>
nnoremap cum /{<cr>va{V<esc>:noh<cr>gvc
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
nnoremap yiG mq/%<cr>t%yT%<esc>gvy`q:noh<cr>
nnoremap yaG mq/%<cr>yf%<esc>gvy`q:noh<cr>
nnoremap diG mq/%<cr>f%dT%<esc>`q:noh<cr>
nnoremap daG mq/%<cr>df%<esc>`q:noh<cr>
nnoremap ciG /%<cr>t%cT%<esc>:noh<cr>gvc
nnoremap caG /%<cr>cf%<esc>:noh<cr>gvc

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
nnoremap <leader>df mq/}<cr>x?\$<cr>xx:noh<cr>`q
nnoremap <leader>dF mq/}<cr>x/\$<cr>xx:noh<cr>`q
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
nnoremap <leader>ij mqviw<ESC>a]<ESC>bi[<ESC>`ql
nnoremap <leader><leader>ij mqviW<ESC>a]<ESC>Bi[<ESC>`ql
vnoremap <leader>ij <ESC>mq`>a]<ESC>`<<ESC>i[<ESC>`><ESC>`ql
nnoremap <leader>dj mqva[o<esc>%x``x`q
nnoremap <leader>dk mqv/[<cr>a[o<esc>%x``x:noh<cr>`q
vnoremap <leader>dj <esc>mq`>/]<cr>x`<?[<cr>x:noh<cr>`q
" ┌──➤ {Text}
nnoremap <leader>in mqviw<ESC>a}<ESC>bi{<ESC>`ql
nnoremap <leader><leader>in mqviW<ESC>a}<ESC>Bi{<ESC>`ql
vnoremap <leader>in <ESC>mq`>a}<ESC>`<<ESC>i{<ESC>`><ESC>`ql
nnoremap <leader>dn mqva{o<esc>%x``x`q
nnoremap <leader>dm mq/{<cr>va{o<esc>%x``x:noh<cr>`q
vnoremap <leader>dn <esc>mq`>/}<cr>x`<?{<cr>x:noh<cr>`q
" ┌──➤ { Text }
nnoremap <leader>iN mqviw<ESC>a }<ESC>bi{ <ESC>`ql
nnoremap <leader><leader>iN mqviW<ESC>a }<ESC>Bi{ <ESC>`ql
vnoremap <leader>iN <ESC>mq`>a }<ESC>`<<ESC>i{ <ESC>`><ESC>`ql
nnoremap <leader>dN mqva{o<esc>%hxx``xx`q
nnoremap <leader>dM mq/{<cr>va{o<esc>%hxx``xx:noh<cr>`q
vnoremap <leader>dN <esc>mq`>/}<cr>hxx`<?{<cr>xx:noh<cr>`q
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
nnoremap <leader>d, mq?<<cr>x/><cr>x:noh<cr>`q
nnoremap <leader>d. mq/><cr>x?<<cr>x:noh<cr>`q
vnoremap <leader>d, <esc>mq`>/><cr>x`<?<<cr>x:noh<cr>`q
" ┌──➤ «Text»
nnoremap <leader>i. mqviw<ESC>a»<ESC>bi«<ESC>`ql
nnoremap <leader><leader>i. mqviW<ESC>a»<ESC>Bi«<ESC>`ql
vnoremap <leader>i. <ESC>mq`>a»<ESC>`<<ESC>i«<ESC>`><ESC>`ql
nnoremap <leader>d. mq/»<cr>x?«<cr>x:noh<cr>`q
vnoremap <leader>d. <esc>mq`>/»<cr>x`<?«<cr>x:noh<cr>`q
" ┌──➤  Text 
nnoremap <leader>i<leader> mqviw<ESC>a <ESC>bi <ESC>`ql
nnoremap <leader><leader>i<leader> mqviw<esc>a <esc>bi <esc>`ql
vnoremap <leader>i<leader> <ESC>mq`>a <ESC>`<<ESC>i <ESC>`><ESC>`ql
nnoremap <leader>d<leader> mq/ <cr>x? <cr>x:noh<cr>`q
vnoremap <leader>d<leader> <esc>mq`>/ <cr>x`<? <cr>x:noh<cr>`q
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

vnoremap <c-j> /^\s*$<cr>:<c-u>noh<cr>gv

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

" Normal [[ and ]] were practically useless, so they now will search for the next or previous bracket
nnoremap ( ?(<cr>:noh<cr>
nnoremap ) /)<cr>:noh<cr>
nnoremap [[ ?[<cr>:noh<cr>
nnoremap ]] /]<cr>:noh<cr>
nnoremap { ?{<cr>:noh<cr>
nnoremap } /}<cr>:noh<cr>

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














