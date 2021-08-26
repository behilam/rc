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

nnoremap die viwld
nnoremap cie viwlc
nnoremap di/ vip:g/\/\/.*$/d<cr>:noh<cr>
nnoremap di> t»vT«d
nnoremap ci> t»vT«c

nnoremap ci. t.vT.c
nnoremap da. t.vF.d
nnoremap ci« /»<cr>hv?«<cr> d<esc>:noh<cr>i
nnoremap di« /»<cr>hv?«<cr> d<esc>:noh<cr>
nnoremap ca« /»<cr>v?«<cr>d<esc>:noh<cr>
nnoremap da« /»<cr>v?«<cr>d<esc>:noh<cr>

nnoremap <leader>t< va<ovd^va<vd$A><esc>


nnoremap <leader><leader>d ggVG"_d
nnoremap <leader><leader>D ggVGd
nnoremap <leader><leader>c ggVG"_c
nnoremap <leader><leader>C ggVGc

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
nnoremap <leader><leader>i] mqviW<ESC>a}<ESC>Bi{<ESC>`ql
vnoremap <leader>i] <ESC>mq`>a}<ESC>`<<ESC>i{<ESC>`><ESC>`ql
nnoremap <leader>d] mqva{o<esc>%x``x`q
vnoremap <leader>d] <esc>mq`>/}<cr>x`<?{<cr>x:noh<cr>`q
" ┌──➤ { Text }
nnoremap <leader>i} mqviw<ESC>a }<ESC>bi{ <ESC>`ql
nnoremap <leader>I] mqviw<ESC>a }<ESC>bi{ <ESC>`ql
nnoremap <leader>I} mqviw<ESC>a }<ESC>bi{ <ESC>`ql
nnoremap <leader><leader>i} mqviW<ESC>a }<ESC>Bi{ <ESC>`ql
nnoremap <leader><leader>I] mqviW<ESC>a }<ESC>Bi{ <ESC>`ql
nnoremap <leader><leader>I} mqviW<ESC>a }<ESC>Bi{ <ESC>`ql
vnoremap <leader>i} <ESC>mq`>a }<ESC>`<<ESC>i{ <ESC>`><ESC>`ql
vnoremap <leader>I] <ESC>mq`>a }<ESC>`<<ESC>i{ <ESC>`><ESC>`ql
vnoremap <leader>I} <ESC>mq`>a }<ESC>`<<ESC>i{ <ESC>`><ESC>`ql
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
