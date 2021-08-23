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

nnoremap <leader>z :noh<CR>

nmap <leader>w :w<CR>
nnoremap <leader>o mqo<ESC>k`q
nnoremap <leader>O mqO<ESC>j`q
nnoremap ó o<esc>cc
nnoremap Ó O<esc>cc

nnoremap <leader>yy "*yy
nnoremap <leader>Y "*Y
nnoremap <leader>yw "*yw
nnoremap <leader>yW "*yW
nnoremap <leader>yiw "*yiw
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

" Delete wrappers
nnoremap <leader>d' mq/'<cr>x?'<cr>x:noh<cr>`q
nnoremap <leader>d" mq/"<cr>x?"<cr>x:noh<cr>`q
nnoremap <leader>d` mq/`<cr>x?`<cr>x:noh<cr>`q
nnoremap <leader>d% mq/%<cr>x?%<cr>x:noh<cr>`q
nnoremap <leader>d$ mq/}<cr>x?\$<cr>xx:noh<cr>`q
nnoremap <leader>d( mqva(o<esc>%x``x`q
nnoremap <leader>d[ mqva[o<esc>%x``x`q
nnoremap <leader>d{ mqva{o<esc>%x``x`q
nnoremap <leader>d< mq/><cr>x?<<cr>x:noh<cr>`q
nnoremap <leader>d‹ mq/›<cr>x?‹<cr>x:noh<cr>`q
nnoremap <leader>d« mq/»<cr>x?«<cr>x:noh<cr>`q
nnoremap <leader>d/ mq//<cr>x?/<cr>x:noh<cr>`q
    " Tags
nnoremap <leader>dt mqvat<`q0i:exe "/^<esc>f<a\\/<esc>/[ >]<cr>i" <esc>"qdF::@q<cr>dd`qdd:noh<cr>
"" Note: Your cursor has to be (anywhere) on top of the opening tag and it only works with spreaded tags (not oneliners) in the form:
 " <tag (optional attributes)>
 "   (optional content)
"" </tag>

nnoremap <leader>t< va<ovd^va<vd$A><esc>


nnoremap <leader><leader>d ggVG"_d
nnoremap <leader><leader>D ggVGd
nnoremap <leader><leader>c ggVG"_c
nnoremap <leader><leader>C ggVGc

" Wrappers
nnoremap <leader>' mqviw<ESC>a'<ESC>bi'<ESC>`ql
nnoremap <leader><leader>' mqviW<ESC>a'<ESC>Bi'<ESC>`ql
nnoremap <leader>" mqviw<ESC>a"<ESC>bi"<ESC>`ql
nnoremap <leader><leader>" mqviW<ESC>a"<ESC>Bi"<ESC>`ql
nnoremap <leader>` mqviw<ESC>a`<ESC>bi`<ESC>`ql
nnoremap <leader><leader>` mqviW<ESC>a`<ESC>Bi`<ESC>`ql
nnoremap <leader>% mqviw<ESC>a%<ESC>bi%<ESC>`ql
nnoremap <leader><leader>% mqviW<ESC>a%<ESC>Bi%<ESC>`ql
nnoremap <leader>$ mqviw<ESC>a}<ESC>bi${<ESC>`qll
nnoremap <leader><leader>$ mqviW<ESC>a}<ESC>Bi${<ESC>`qll
nnoremap <leader>( mqviw<ESC>a)<ESC>bi(<ESC>`ql
nnoremap <leader><leader>( mqviW<ESC>a)<ESC>Bi(<ESC>`ql
nnoremap <leader>[ mqviw<ESC>a]<ESC>bi[<ESC>`ql
nnoremap <leader><leader>[ mqviW<ESC>a]<ESC>Bi[<ESC>`ql
nnoremap <leader>{ mqviw<ESC>a}<ESC>bi{<ESC>`ql
nnoremap <leader><leader>{ mqviW<ESC>a}<ESC>Bi{<ESC>`ql
nnoremap <leader>/ mqviw<ESC>a/<ESC>bi/<ESC>`ql
nnoremap <leader><leader>/ mqviW<ESC>a/<ESC>Bi/<ESC>`ql
nnoremap <leader>< mqviw<ESC>a><ESC>bi<<ESC>`ql
nnoremap <leader><leader>< mqviW<ESC>a><ESC>Bi<<ESC>`ql
nnoremap <leader>« mqviw<ESC>a»<ESC>bi«<ESC>`ql
nnoremap <leader><leader>« mqviW<ESC>a»<ESC>Bi«<ESC>`ql
nnoremap <leader>‹ mqviw<ESC>a›<ESC>bi‹<ESC>`ql
nnoremap <leader><leader>‹ mqviW<ESC>a›<ESC>Bi‹<ESC>`ql
nnoremap <leader>_ mqviw<ESC>a <ESC>bi <ESC>`ql
nnoremap <leader><leader>_ mqviW<ESC>a <ESC>Bi <ESC>`ql
vnoremap <leader>' <ESC>mq`>a'<ESC>`<<ESC>i'<ESC>`><ESC>`ql
vnoremap <leader>" <ESC>mq`>a"<ESC>`<<ESC>i"<ESC>`><ESC>`ql
vnoremap <leader>` <ESC>mq`>a`<ESC>`<<ESC>i`<ESC>`><ESC>`ql
vnoremap <leader>$ <ESC>mq`>a}<ESC>`<<ESC>i${<ESC>`><ESC>`qll
vnoremap <leader>( <ESC>mq`>a)<ESC>`<<ESC>i(<ESC>`><ESC>`ql
vnoremap <leader>[ <ESC>mq`>a]<ESC>`<<ESC>i[<ESC>`><ESC>`ql
vnoremap <leader>{ <ESC>mq`>a}<ESC>`<<ESC>i{<ESC>`><ESC>`ql
vnoremap <leader>/ <ESC>mq`>a/<ESC>`<<ESC>i/<ESC>`><ESC>`ql
vnoremap <leader>_ <ESC>mq`>a <ESC>`<<ESC>i <ESC>`><ESC>`ql
vnoremap <leader>< <ESC>mq`>a><ESC>`<<ESC>i<<ESC>`><ESC>`ql
vnoremap <leader>‹ <ESC>mq`>a›<ESC>`<<ESC>i‹<ESC>`><ESC>`ql
vnoremap <leader>« <ESC>mq`>a»<ESC>`<<ESC>i«<ESC>`><ESC>`ql

nnoremap <leader>; mq$a;<ESC>`q
nnoremap <leader>, mq$a,<ESC>`q

nnoremap <leader>l $
nnoremap <leader>h ^
nnoremap <leader>H 0

" Change inside parens/brackets shortcut
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

nnoremap <localleader><localleader>g :set operatorfunc=GrepOperator<cr>g@
vnoremap <localleader><localleader>g :<c-u>call GrepOperator(visualmode())<cr>

nnoremap <localleader><localleader>f :call Test("w")<cr>

function! Test(x)
    let extension = expand('%:e')

    " Python
    if extension =~# "py"
        exec "normal! vi" . a:x . "\<ESC>a)\<ESC>biprint(\<ESC>%"

    " Javascript
    elseif extension =~# "^js" || "^ts"
        exec "normal! vi" . a:x . "\<ESC>a)\<ESC>biconsole.log(\<ESC>%"

    " Rust
    elseif extension ==# "rs"
        echo "Rust :D"
    else
        echo "###   «Mi ne rekonas ĉi tiun dosiertipon...»   ###"
    endif
endfunction
