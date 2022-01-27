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
nnoremap di. /<<cr>vi<<esc>:noh<cr>gvd
nnoremap da. /<<cr>va<<esc>:noh<cr>gvd
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
nnoremap di" /'<cr>vi'<esc>:noh<cr>gvd
nnoremap da" /'<cr>va'<esc>:noh<cr>gvd
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
nnoremap di: /"<cr>vi"<esc>:noh<cr>gvd
nnoremap da: /"<cr>va"<esc>:noh<cr>gvd
nnoremap ci: /"<cr>vi"<esc>:noh<cr>gvc
nnoremap ca: /"<cr>va"<esc>:noh<cr>gvc
"" (text)
nnoremap vir vi(
nnoremap var va(
nnoremap yir mqyi(`q:<cr>
nnoremap yar mqya(`q:<cr>
nnoremap dir di(
nnoremap dar da(
nnoremap cir ci(
nnoremap car ca(
nnoremap dur va(Vd
nnoremap cur va(Vc
"" ──>(text)
nnoremap vit /(<cr>vi(<esc>:noh<cr>gv
nnoremap vat /(<cr>va(<esc>:noh<cr>gv
nnoremap yit mq/(<cr>vi(<esc>gvy`q:noh<cr>
nnoremap yat mq/(<cr>va(<esc>gvy`q:noh<cr>
nnoremap dit /(<cr>vi(<esc>:noh<cr>gvd
nnoremap dat /(<cr>va(<esc>:noh<cr>gvd
nnoremap cit /(<cr>vi(<esc>:noh<cr>gvc
nnoremap cat /(<cr>va(<esc>:noh<cr>gvc
nnoremap dut /(<cr>va(V<esc>:noh<cr>gvd
nnoremap cut /(<cr>va(V<esc>:noh<cr>gvc
"" {text}
nnoremap vic vi{
nnoremap vac va{
nnoremap yic mqyi{`q:<cr>
nnoremap yac mqya{`q:<cr>
nnoremap dic di{
nnoremap dac da{
nnoremap cic ci{
nnoremap cac ca{
nnoremap duc va{Vd
nnoremap cuc va{Vc
""  ──>{text}
nnoremap viv /{<cr>vi{<esc>:noh<cr>gv
nnoremap vav /{<cr>va{<esc>:noh<cr>gv
nnoremap yiv mq/{<cr>vi{<esc>gvy`q:noh<cr>
nnoremap yav mq/{<cr>va{<esc>gvy`q:noh<cr>
nnoremap div /{<cr>vi{<esc>:noh<cr>gvd
nnoremap dav /{<cr>va{<esc>:noh<cr>gvd
nnoremap civ /{<cr>vi{<esc>:noh<cr>gvc
nnoremap cav /{<cr>va{<esc>:noh<cr>gvc
nnoremap duv /{<cr>va{V<esc>:noh<cr>gvd
nnoremap cuv /{<cr>va{V<esc>:noh<cr>gvc
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
nnoremap diG /%<cr>t%dT%<esc>:noh<cr>gvd
nnoremap daG /%<cr>df%<esc>:noh<cr>gvd
nnoremap ciG /%<cr>t%cT%<esc>:noh<cr>gvc
nnoremap caG /%<cr>cf%<esc>:noh<cr>gvc
"" [text]
nnoremap yu[ mqva[Vy`q:<cr>
nnoremap du[ va[Vd
nnoremap cu[ va[Vc
"" ──>[text]
nnoremap vi] /[<cr>vi[<esc>:noh<cr>gv
nnoremap va] /[<cr>va[<esc>:noh<cr>gv
nnoremap yi] mq/[<cr>vi[<esc>gvy`q:noh<cr>
nnoremap ya] mq/[<cr>va[<esc>gvy`q:noh<cr>
nnoremap di] /[<cr>vi[<esc>:noh<cr>gvd
nnoremap da] /[<cr>va[<esc>:noh<cr>gvd
nnoremap ci] /[<cr>vi[<esc>:noh<cr>gvc
nnoremap ca] /[<cr>va[<esc>:noh<cr>gvc
nnoremap du] /[<cr>va[V<esc>:noh<cr>gvd
nnoremap cu] /[<cr>va[V<esc>:noh<cr>gvc

nnoremap <leader>t< va<ovd^va<vd$A><esc>


nnoremap <leader><leader>d ggVG"_d
nnoremap <leader><leader>D ggVGd
vnoremap <leader><leader>d "*d
nnoremap <leader><leader>c ggVG"_c
nnoremap <leader><leader>C ggVGc
vnoremap <leader><leader>c "*c

" « WRAPPERS »
" ┌──➤ 'Text'
nnoremap <leader>i' mqviw<ESC>a'<ESC>bi'<ESC>`ql
nnoremap <leader><leader>i' mqviW<ESC>a'<ESC>Bi'<ESC>`ql
vnoremap <leader>i' <ESC>mq`>a'<ESC>`<<ESC>i'<ESC>`><ESC>`ql
nnoremap <leader>d' mq/'<cr>x?'<cr>x:noh<cr>`q
vnoremap <leader>d' <esc>mq`>/'<cr>x`<?'<cr>x:noh<cr>`q
" ┌──➤ "Text"
nnoremap <leader>i; mqviw<ESC>a"<ESC>bi"<ESC>`ql
nnoremap <leader><leader>i; mqviW<ESC>a"<ESC>Bi"<ESC>`ql
vnoremap <leader>i; <ESC>mq`>a"<ESC>`<<ESC>i"<ESC>`><ESC>`ql
nnoremap <leader>d; mq/"<cr>x?"<cr>x:noh<cr>`q
vnoremap <leader>d; <esc>mq`>/"<cr>x`<?"<cr>x:noh<cr>`q
" ┌──➤ `Text`
nnoremap <leader>i` mqviw<ESC>a`<ESC>bi`<ESC>`ql
nnoremap <leader><leader>i` mqviW<ESC>a`<ESC>Bi`<ESC>`ql
vnoremap <leader>i` <ESC>mq`>a`<ESC>`<<ESC>i`<ESC>`><ESC>`ql
nnoremap <leader>d` mq/`<cr>x?`<cr>x:noh<cr>`q
vnoremap <leader>d` <esc>mq`>/`<cr>x`<?`<cr>x:noh<cr>`q
" ┌──➤ ${Text}
nnoremap <leader>if mqviw<ESC>a}<ESC>bi${<ESC>`qll
nnoremap <leader><leader>if mqviW<ESC>a}<ESC>Bi${<ESC>`qll
vnoremap <leader>if <ESC>mq`>a}<ESC>`<<ESC>i${<ESC>`><ESC>`qll
nnoremap <leader>df mq/}<cr>x?\$<cr>xx:noh<cr>`q
vnoremap <leader>df <esc>mq`>/}<cr>x`<?$<cr>xx:noh<cr>`q
" ┌──➤ %Text%
nnoremap <leader>ig mqviw<ESC>a%<ESC>bi%<ESC>`ql
nnoremap <leader><leader>ig mqviW<ESC>a%<ESC>Bi%<ESC>`ql
vnoremap <leader>ig <ESC>mq`>a%<ESC>`<<ESC>i%<ESC>`><ESC>`ql
nnoremap <leader>dg mq/%<cr>x?%<cr>x:noh<cr>`q
vnoremap <leader>dg <esc>mq`>/%<cr>x`<?%<cr>x:noh<cr>`q
" ┌──➤ (Text)
nnoremap <leader>ir mqviw<ESC>a)<ESC>bi(<ESC>`ql
nnoremap <leader><leader>ir mqviW<ESC>a)<ESC>Bi(<ESC>`ql
vnoremap <leader>ir <ESC>mq`>a)<ESC>`<<ESC>i(<ESC>`><ESC>`ql
nnoremap <leader>dr mqva(o<esc>%x``x`q
vnoremap <leader>dr <esc>mq`>/)<cr>x`<?(<cr>x:noh<cr>`q
" ┌──➤ [Text]
nnoremap <leader>i[ mqviw<ESC>a]<ESC>bi[<ESC>`ql
nnoremap <leader><leader>i[ mqviW<ESC>a]<ESC>Bi[<ESC>`ql
vnoremap <leader>i[ <ESC>mq`>a]<ESC>`<<ESC>i[<ESC>`><ESC>`ql
nnoremap <leader>d[ mqva[o<esc>%x``x`q
vnoremap <leader>d[ <esc>mq`>/]<cr>x`<?[<cr>x:noh<cr>`q
" ┌──➤ {Text}
nnoremap <leader>i] mqviw<ESC>a}<ESC>bi{<ESC>`ql
nnoremap <leader>ic mqviw<ESC>a}<ESC>bi{<ESC>`ql
nnoremap <leader><leader>i] mqviW<ESC>a}<ESC>Bi{<ESC>`ql
nnoremap <leader><leader>ic mqviW<ESC>a}<ESC>Bi{<ESC>`ql
vnoremap <leader>i] <ESC>mq`>a}<ESC>`<<ESC>i{<ESC>`><ESC>`ql
vnoremap <leader>ic <ESC>mq`>a}<ESC>`<<ESC>i{<ESC>`><ESC>`ql
nnoremap <leader>d] mqva{o<esc>%x``x`q
nnoremap <leader>dc mqva{o<esc>%x``x`q
vnoremap <leader>d] <esc>mq`>/}<cr>x`<?{<cr>x:noh<cr>`q
vnoremap <leader>dc <esc>mq`>/}<cr>x`<?{<cr>x:noh<cr>`q
" ┌──➤ { Text }
nnoremap <leader>iv mqviw<ESC>a }<ESC>bi{ <ESC>`ql
nnoremap <leader><leader>iv mqviW<ESC>a }<ESC>Bi{ <ESC>`ql
vnoremap <leader>iv <ESC>mq`>a }<ESC>`<<ESC>i{ <ESC>`><ESC>`ql
nnoremap <leader>dv mqva{o<esc>%hxx``xx`q
vnoremap <leader>dv <esc>mq`>/}<cr>hxx`<?{<cr>xx:noh<cr>`q
" ┌──➤ /Text/
nnoremap <leader>i/ mqviw<ESC>a/<ESC>bi/<ESC>`ql
nnoremap <leader><leader>i/ mqviW<ESC>a/<ESC>Bi/<ESC>`ql
vnoremap <leader>i/ <ESC>mq`>a/<ESC>`<<ESC>i/<ESC>`><ESC>`ql
nnoremap <leader>d/ mq//<cr>x?/<cr>x:noh<cr>`q
vnoremap <leader>d/ <esc>mq`>//<cr>x`<?/<cr>x:noh<cr>`q
" ┌──➤ <Text>
nnoremap <leader>i, mqviw<ESC>a><ESC>bi<<ESC>`ql
nnoremap <leader><leader>i, mqviW<ESC>a><ESC>Bi<<ESC>`ql
vnoremap <leader>i, <ESC>mq`>a><ESC>`<<ESC>i<<ESC>`><ESC>`ql
nnoremap <leader>d, mq/><cr>x?<<cr>x:noh<cr>`q
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














