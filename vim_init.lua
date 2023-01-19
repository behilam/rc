-- set encoding=utf-8
-- set fileencoding=utf-8
-- set shortmess=filnxtToOI
-- set guifont=Consola:h10
-- set gdefault
-- set nu

-- hi LightspeedCursor gui=reverse
vim.g.mapleader = ' ';
vim.g.maplocalleader = '\\';

if nvim then
    vim.api.nvim_command('call plug#begin()')
    vim.api.nvim_command('Plug "tpope/vim-repeat"')
    vim.api.nvim_command('Plug "ggandor/lightspeed.nvim"')
    vim.api.nvim_command('Plug "glacambre/firenvim", { "do": { _ -> firenvim#install(0) } }')
    vim.api.nvim_command('call plug#end()')
end

if not vscode then
    -- Alt-z -- TODO: needs fixing for neovim
    vim.keymap.set('n', 'ú', function() vim.api.nvim_command('set wrap!') end)
    vim.keymap.set('i', 'ú', function() vim.api.nvim_command('set wrap!') end)
    vim.keymap.set('i', 'jk', '<esc>')
    vim.keymap.set('i', '<c-;>', '<esc>O')
    vim.keymap.set('n', '<c-k><c-l>', function() vim.api.nvim_command('set nu!') end)

    -- Commenting blocks of code.
    local vanillaNvimComments = vim.api.nvim_create_augroup('vanilla nvim comments', { clear = false })
    vim.api.nvim_create_autocmd('FileType',
        {
            pattern = 'c,cpp,java,scala,rust',
            callback = function() vim.b.comment_leader = '// ' end,
            group = vanillaNvimComments
        })
    vim.api.nvim_create_autocmd('FileType',
        {
            pattern = 'sh,ruby,python,conf,fstab',
            callback = function() vim.b.comment_leader = '# ' end,
            group = vanillaNvimComments
        })
    vim.api.nvim_create_autocmd('FileType',
        {
            pattern = 'tex',
            callback = function() vim.b.comment_leader = '% ' end,
            group = vanillaNvimComments
        })
    vim.api.nvim_create_autocmd('FileType',
        {
            pattern = 'mail',
            callback = function() vim.b.comment_leader = '> ' end,
            group = vanillaNvimComments
        })
    vim.api.nvim_create_autocmd('FileType',
        {
            pattern = 'vim',
            callback = function() vim.b.comment_leader = '" ' end,
            group = vanillaNvimComments
        })
    vim.api.nvim_create_autocmd('FileType',
        {
            pattern = 'ahk',
            callback = function() vim.b.comment_leader = '; ' end,
            group = vanillaNvimComments
        })
    -- TODO: Add vanilla commenting for neovim
    -- vim.keymap.set('n', 'gc', ':<C-B>silent <C-E>s/^/<C-R>=escape(b:comment_leader,\'\\/\')<CR>/<CR>:nohlsearch<CR>')
    -- vim.keymap.set('n', 'gC', ':<C-B>silent <C-E>s/^\\V<C-R>=escape(b:comment_leader,\'\\/\')<CR>//e<CR>:nohlsearch<CR>')
end

-- "  Firenvim
vim.g.timer_firenvim = ""
if started_by_firenvim then
    vim.keymap.set('i', '{', '{}<Left>')
    vim.keymap.set('i', '<expr>', '}  strpart(getline(\'.\'), col(\'.\')-1, 1) == "}" ? "\\<Right>" : "}"')
    vim.keymap.set('i', '[', '[]<Left>')
    vim.keymap.set('i', '<expr>', ']  strpart(getline(\'.\'), col(\'.\')-1, 1) == "]" ? "\\<Right>" : "]"')
    vim.keymap.set('i', '(', '()<Left>')
    vim.keymap.set('i', '<expr>', ')  strpart(getline(\'.\'), col(\'.\')-1, 1) == ")" ? "\\<Right>" : ")"')
    vim.keymap.set('i', '<expr>',
        '\' strpart(getline(\'.\'), col(\'.\')-1, 1) == "\'" ? "\\<Right>" : "\\\'\\\'\\<Left>"')

    -- -- au BufEnter colab.*.txt set ft=python
    -- -- au BufEnter github.com_*.txt set ft=markdown
    -- --
    -- vim.g.firenvim_config = {
    --     localSettings = {
    --         ['.*'] = {
    --             takeover = 'never',
    --             cmdline = 'firenvim',
    --         }
    --     }
    -- };

    -- -- Throttled autoupdate text area
    -- vim.g.timer_started = false
    -- function myWrite(timer)
    --     vim.g.timer_started = false;
    --     vim.g.write();
    -- end

    -- function delayMyWrite()
    --     if vim.g.timer_started then
    --         vim.api.nvim_command('call timer_stop(vim.g.timer_firenvim)')
    --     end
    --     vim.g.timer_started = true
    --     print(vim.g.timer_firenvim)
    --     vim.g.timer_firenvim = vim.g.timer_start(1000, 'myWrite')
    -- end

    -- au TextChanged * ++nested call Delay_My_Write()
    -- au TextChangedI * ++nested call Delay_My_Write()
end

vim.keymap.set('n', 'p', ']p')
vim.keymap.set('n', 'P', ']P')
vim.keymap.set('n', ']p', 'p')
vim.keymap.set('n', ']P', 'P')
vim.keymap.set('v', 'p', 'P')
vim.keymap.set('v', 'P', 'p')

vim.keymap.set('n', 'q', 'i_<esc>r')
vim.keymap.set('n', 'Q', 'q')
vim.keymap.set('n', 'g:', 'Q')

vim.keymap.set('n', 'ß', '<BS>?_<CR>:noh<CR><SPACE>')
vim.keymap.set('n', 'ŭ', '/_<CR>:noh<CR><SPACE>')
vim.keymap.set('n', 'é', '<SPACE>/_<CR>:noh<CR><BS>')
vim.keymap.set('n', 'É', '<BS>?_<CR>:noh<CR><BS>')

vim.keymap.set('n', '<leader>z', ':noh<CR>')

vim.keymap.set('n', '<leader>w', ':w<CR>')
vim.keymap.set('n', '<leader>o', 'mqo<ESC>k`q')
vim.keymap.set('n', '<leader>O', 'mqO<ESC>j`q')
vim.keymap.set('n', 'ó', 'o<esc>cc')
vim.keymap.set('n', 'Ó', 'O<esc>cc')

vim.keymap.set('n', '<bs>', 'ge')
vim.keymap.set('v', '<bs>', 'ge')
vim.keymap.set('n', '<s-bs>', 'gE')
vim.keymap.set('v', '<s-bs>', 'gE')

-- Clipboard shortcuts
vim.keymap.set('n', '<leader>x', 'viw"*d')
vim.keymap.set('n', '<leader><leader>x', 'viW"*d')
vim.keymap.set('v', '<leader>x', '"*d')
vim.keymap.set('n', '<leader><leader>d', 'ggVG"_d')
vim.keymap.set('n', '<leader><leader>D', 'ggVGd')
vim.keymap.set('v', '<leader><leader>d', '"*d')
vim.keymap.set('n', '<leader><leader>c', 'ggVG"_c')
vim.keymap.set('n', '<leader><leader>C', 'ggVGc')
vim.keymap.set('v', '<leader><leader>c', '"*c')

vim.keymap.set('n', '<leader>y', '"*y')
vim.keymap.set('v', '<leader>y', '"*y')
vim.keymap.set('n', '<leader>Y', '"*y$')
vim.keymap.set('n', '<leader><leader>y', 'ggVG"*y')

vim.keymap.set('n', '<leader>v', 'ggVG')

vim.keymap.set('n', '<leader>p', '"*p')
vim.keymap.set('x', '<leader>p', '"*p')
vim.keymap.set('n', '<leader>P', '"*P')
vim.keymap.set('x', '<leader>P', '"*P')
vim.keymap.set('n', '<leader><leader>p', 'ggVG"*p')

vim.keymap.set('n', 'dh', 'dd')
vim.keymap.set('n', 'dp', 'ddp')
vim.keymap.set('n', 'yp', 'yyp')
-- nnoremap cp yypk<CMD>call VSCodeNotify('editor.action.commentLine')<CR>j
vim.keymap.set('v', '<leader>j', 'yP`<')

-- Delete row content
vim.keymap.set('n', 'd<leader>', '0"_D')
vim.keymap.set('n', 'dc', '^"_D')
vim.keymap.set('n', 'dC', '^_D')
vim.keymap.set('v', '<leader>x', ':s/^.*$<cr>')

vim.keymap.set('v', 'x', '"_d')

-- Alternative in-wrapper modifiers
--*** :<cr> is a manual fix for the q marks to work well in VSCode.
--*** TODO: It would be worth it to check that bug.
--" word\s
vim.keymap.set('n', 'vie', 'viwl')
vim.keymap.set('n', 'yie', 'mqviwly`q:<cr>')
vim.keymap.set('n', 'die', 'viwld')
vim.keymap.set('n', 'cie', 'viwlc')
vim.keymap.set('n', 'viE', 'viWl')
vim.keymap.set('n', 'yiE', 'mqviWly`q:<cr>')
vim.keymap.set('n', 'diE', 'viWld')
vim.keymap.set('n', 'ciE', 'viWlc')
--" // Block
vim.keymap.set('n', 'di/', 'vip:g/^%s*%/%/.*$/d<cr>:noh<cr>')
--" <text>
vim.keymap.set('n', 'vi,', 'vi<')
vim.keymap.set('n', 'va,', 'va<')
vim.keymap.set('n', 'yi,', 'mqyi<`q:<cr>')
vim.keymap.set('n', 'ya,', 'mqya<`q:<cr>')
vim.keymap.set('n', 'di,', 'di<')
vim.keymap.set('n', 'ci,', 'ci<')
vim.keymap.set('n', 'da,', 'da<')
vim.keymap.set('n', 'ca,', 'ca<')
vim.keymap.set('n', 'vu,', 'va<V')
vim.keymap.set('n', 'yu,', 'mqva<Vy`q:noh<cr>')
vim.keymap.set('n', 'du,', 'va<Vd')
vim.keymap.set('n', 'cu,', 'va<Vc')
--" ──><text>
vim.keymap.set('n', 'vi.', '/<<cr>vi<<esc>:noh<cr>gv')
vim.keymap.set('n', 'va.', '/<<cr>va<<esc>:noh<cr>gv')
vim.keymap.set('n', 'vu.', '/<<cr>va<V<esc>:noh<cr>gv')
vim.keymap.set('n', 'yi.', 'mq/<<cr>vi<y`q:noh<cr>')
vim.keymap.set('n', 'ya.', 'mq/<<cr>va<y`q:noh<cr>')
vim.keymap.set('n', 'yu.', 'mq/<<cr>va<Vy`q:noh<cr>')
vim.keymap.set('n', 'di.', 'mq/<<cr>vi<d`q:noh<cr>')
vim.keymap.set('n', 'da.', 'mq/<<cr>va<d`q:noh<cr>')
vim.keymap.set('n', 'du.', 'mq/<<cr>va<Vd`q:noh<cr>')
vim.keymap.set('n', 'ci.', '/<<cr>vi<<esc>:noh<cr>gvc')
vim.keymap.set('n', 'ca.', '/<<cr>va<<esc>:noh<cr>gvc')
vim.keymap.set('n', 'cu.', '/<<cr>va<V<esc>:noh<cr>gvc')
--" 'text'
vim.keymap.set('n', 'vu\'', 'vi\'V')
vim.keymap.set('n', 'yu\'', 'mqvi\'Vy`q:noh<cr>')
vim.keymap.set('n', 'du\'', 'mqvi\'Vd`q:noh<cr>')
vim.keymap.set('n', 'cu\'', 'vi\'Vc')
--" ──>'text'
vim.keymap.set('n', 'vi"', '/\' < cr > vi \'<esc>:noh<cr>gv')
vim.keymap.set('n', 'va"', '/\' < cr > va \'<esc>:noh<cr>gv')
vim.keymap.set('n', 'vu"', '/\' < cr > va \'V<esc>:noh<cr>gv')
vim.keymap.set('n', 'yi"', 'mq/\' < cr > vi \'y`q:noh<cr>')
vim.keymap.set('n', 'ya"', 'mq/\' < cr > va \'y`q:noh<cr>')
vim.keymap.set('n', 'yu"', 'mq/\' < cr > va \'Vy`q:noh<cr>')
vim.keymap.set('n', 'di"', 'mq/\' < cr > vi \'d`q:noh<cr>')
vim.keymap.set('n', 'da"', 'mq/\' < cr > va \'d`q:noh<cr>')
vim.keymap.set('n', 'du"', 'mq/\' < cr > va \'Vd`q:noh<cr>')
vim.keymap.set('n', 'ci"', '/\' < cr > vi \'<esc>:noh<cr>gvc')
vim.keymap.set('n', 'ca"', '/\' < cr > va \'<esc>:noh<cr>gvc')
vim.keymap.set('n', 'cu"', '/\' < cr > va \'V<esc>:noh<cr>gvc')
--" "text"
vim.keymap.set('n', 'vi;', 'vi"')
vim.keymap.set('n', 'va;', 'va"')
vim.keymap.set('n', 'vu;', 'va"V')
vim.keymap.set('n', 'yi;', 'mqyi"`q:<cr>')
vim.keymap.set('n', 'ya;', 'mqya"`q:<cr>')
vim.keymap.set('n', 'yu;', 'mqva"Vy`q:<cr>')
vim.keymap.set('n', 'di;', 'di"')
vim.keymap.set('n', 'da;', 'da"')
vim.keymap.set('n', 'du;', 'va"Vd')
vim.keymap.set('n', 'ci;', 'ci"')
vim.keymap.set('n', 'ca;', 'ca"')
vim.keymap.set('n', 'cu;', 'va"Vc')
--" ──>"text"
vim.keymap.set('n', 'vi:', '/"<cr>vi"<esc>:noh<cr>gv')
vim.keymap.set('n', 'va:', '/"<cr>va"<esc>:noh<cr>gv')
vim.keymap.set('n', 'vu:', '/"<cr>va"V<esc>:noh<cr>gv')
vim.keymap.set('n', 'yi:', 'mq/"<cr>vi"y`q:noh<cr>')
vim.keymap.set('n', 'ya:', 'mq/"<cr>va"y`q:noh<cr>')
vim.keymap.set('n', 'yu:', 'mq/"<cr>va"Vy`q:noh<cr>')
vim.keymap.set('n', 'di:', 'mq/"<cr>vi"d`q:noh<cr>')
vim.keymap.set('n', 'da:', 'mq/"<cr>va"d`q:noh<cr>')
vim.keymap.set('n', 'du:', 'mq/"<cr>va"Vd`q:noh<cr>')
vim.keymap.set('n', 'ci:', '/"<cr>vi"<esc>:noh<cr>gvc')
vim.keymap.set('n', 'ca:', '/"<cr>va"<esc>:noh<cr>gvc')
vim.keymap.set('n', 'cu:', '/"<cr>va"V<esc>:noh<cr>gvc')
--" (text)
vim.keymap.set('n', 'viu', 'vi(')
vim.keymap.set('n', 'vau', 'va(')
vim.keymap.set('n', 'vuu', 'va(V')
vim.keymap.set('n', 'yiu', 'mqyi(`q:<cr>')
vim.keymap.set('n', 'yau', 'mqya(`q:<cr>')
vim.keymap.set('n', 'yuu', 'mqva(Vy`q:<cr>')
vim.keymap.set('n', 'diu', 'di(')
vim.keymap.set('n', 'dau', 'da(')
vim.keymap.set('n', 'duu', 'va(Vd')
vim.keymap.set('n', 'ciu', 'ci(')
vim.keymap.set('n', 'cau', 'ca(')
vim.keymap.set('n', 'cuu', 'va(Vc')
--" ──>(text)
vim.keymap.set('n', 'vii', '/(<cr>vi(<esc>:noh<cr>gv')
vim.keymap.set('n', 'vai', '/(<cr>va(<esc>:noh<cr>gv')
vim.keymap.set('n', 'vui', '/(<cr>va(V<esc>:noh<cr>gv')
vim.keymap.set('n', 'yii', 'mq/(<cr>vi(y`q:noh<cr>')
vim.keymap.set('n', 'yai', 'mq/(<cr>va(y`q:noh<cr>')
vim.keymap.set('n', 'yui', 'mq/(<cr>va(Vy`q:noh<cr>')
vim.keymap.set('n', 'dii', 'mq/(<cr>vi(d`q:noh<cr>')
vim.keymap.set('n', 'dai', 'mq/(<cr>va(d`q:noh<cr>')
vim.keymap.set('n', 'dui', 'mq/(<cr>va(Vd`q:noh<cr>')
vim.keymap.set('n', 'cii', '/(<cr>vi(<esc>:noh<cr>gvc')
vim.keymap.set('n', 'cai', '/(<cr>va(<esc>:noh<cr>gvc')
vim.keymap.set('n', 'cui', '/(<cr>va(V<esc>:noh<cr>gvc')
--" [text]
vim.keymap.set('n', 'vi[', 'vi[')
vim.keymap.set('n', 'va[', 'va[')
vim.keymap.set('n', 'vu[', 'va[V')
vim.keymap.set('n', 'yi[', 'mqyi[`q:<cr>')
vim.keymap.set('n', 'ya[', 'mqya[`q:<cr>')
vim.keymap.set('n', 'yu[', 'mqva[Vy`q:<cr>')
vim.keymap.set('n', 'di[', 'di[')
vim.keymap.set('n', 'da[', 'da[')
vim.keymap.set('n', 'du[', 'va[Vd')
vim.keymap.set('n', 'ci[', 'ci[')
vim.keymap.set('n', 'ca[', 'ca[')
vim.keymap.set('n', 'cu[', 'va[Vc')
--" ──>[text]
vim.keymap.set('n', 'vi]', '/[<cr>vi[<esc>:noh<cr>gv')
vim.keymap.set('n', 'va]', '/[<cr>va[<esc>:noh<cr>gv')
vim.keymap.set('n', 'vu]', '/[<cr>va[V<esc>:noh<cr>gv')
vim.keymap.set('n', 'yi]', 'mq/[<cr>vi[y`q:noh<cr>')
vim.keymap.set('n', 'ya]', 'mq/[<cr>va[y`q:noh<cr>')
vim.keymap.set('n', 'yu]', 'mq/[<cr>va[Vy`q:noh<cr>')
vim.keymap.set('n', 'di]', 'mq/[<cr>vi[d`q:noh<cr>')
vim.keymap.set('n', 'da]', 'mq/[<cr>va[d`q:noh<cr>')
vim.keymap.set('n', 'du]', 'mq/[<cr>va[Vd`q:noh<cr>')
vim.keymap.set('n', 'ci]', '/[<cr>vi[<esc>:noh<cr>gvc')
vim.keymap.set('n', 'ca]', '/[<cr>va[<esc>:noh<cr>gvc')
vim.keymap.set('n', 'cu]', '/[<cr>va[V<esc>:noh<cr>gvc')
--" {text}
vim.keymap.set('n', 'vij', 'vi{')
vim.keymap.set('n', 'vaj', 'va{')
vim.keymap.set('n', 'vuj', 'va{V')
vim.keymap.set('n', 'yij', 'mqyi{`q:<cr>')
vim.keymap.set('n', 'yaj', 'mqya{`q:<cr>')
vim.keymap.set('n', 'yuj', 'mqva{Vy`q:<cr>')
vim.keymap.set('n', 'dij', 'di{')
vim.keymap.set('n', 'daj', 'da{')
vim.keymap.set('n', 'duj', 'va{Vd')
vim.keymap.set('n', 'cij', 'ci{')
vim.keymap.set('n', 'caj', 'ca{')
vim.keymap.set('n', 'cuj', 'va{Vc')
--"  ──>{text}
vim.keymap.set('n', 'vik', '/{<cr>vi{<esc>:noh<cr>gv')
vim.keymap.set('n', 'vak', '/{<cr>va{<esc>:noh<cr>gv')
vim.keymap.set('n', 'vuk', '/{<cr>va{V<esc>:noh<cr>gv')
vim.keymap.set('n', 'yik', 'mq/{<cr>vi{y`q:noh<cr>')
vim.keymap.set('n', 'yak', 'mq/{<cr>va{y`q:noh<cr>')
vim.keymap.set('n', 'yuk', 'mq/{<cr>va{Vy`q:noh<cr>')
vim.keymap.set('n', 'dik', 'mq/{<cr>vi{d`q:noh<cr>')
vim.keymap.set('n', 'dak', 'mq/{<cr>va{d`q:noh<cr>')
vim.keymap.set('n', 'duk', 'mq/{<cr>va{Vd`q:noh<cr>')
vim.keymap.set('n', 'cik', '/{<cr>vi{<esc>:noh<cr>gvc')
vim.keymap.set('n', 'cak', '/{<cr>va{<esc>:noh<cr>gvc')
vim.keymap.set('n', 'cuk', '/{<cr>va{V<esc>:noh<cr>gvc')
--" ${text}
vim.keymap.set('n', 'vaf', 'va{oho')
vim.keymap.set('n', 'vuf', 'va{V')
vim.keymap.set('n', 'yaf', 'mqva{ohy`q:<cr>')
vim.keymap.set('n', 'yuf', 'mqva{Vy`q:<cr>')
vim.keymap.set('n', 'dif', 'di{')
vim.keymap.set('n', 'daf', 'va{ohd')
vim.keymap.set('n', 'duf', 'va{Vd')
vim.keymap.set('n', 'cif', 'ci{')
vim.keymap.set('n', 'caf', 'va{ohc')
vim.keymap.set('n', 'cuf', 'va{Vc')
--"  ──>${text}
vim.keymap.set('n', 'viF', '/{<cr>vi{<esc>:noh<cr>gv')
vim.keymap.set('n', 'vaF', '/{<cr>va{oho<esc>:noh<cr>gv')
vim.keymap.set('n', 'vuF', '/{<cr>va{V<esc>:noh<cr>gv')
vim.keymap.set('n', 'yiF', 'mq/{<cr>vi{y`q:noh<cr>')
vim.keymap.set('n', 'yaF', 'mq/{<cr>va{ohy`q:noh<cr>')
vim.keymap.set('n', 'yuF', 'mq/{<cr>va{Vy`q:noh<cr>')
vim.keymap.set('n', 'diF', 'mq/{<cr>vi{d`q:noh<cr>')
vim.keymap.set('n', 'daF', 'mq/{<cr>va{ohd`q:noh<cr>')
vim.keymap.set('n', 'duF', 'mq/{<cr>va{Vd`q:noh<cr>')
vim.keymap.set('n', 'ciF', '/{<cr>vi{<esc>:noh<cr>gvc')
vim.keymap.set('n', 'caF', '/{<cr>va{oh<esc>:noh<cr>gvc')
vim.keymap.set('n', 'cuF', '/{<cr>va{V<esc>:noh<cr>gvc')
--" %text%
vim.keymap.set('n', 'vig', 't%vT%')
vim.keymap.set('n', 'vag', 'f%vF%')
vim.keymap.set('n', 'yig', 'mqt%yT%`q:<cr>')
vim.keymap.set('n', 'yag', 'mqf%yF%`q:<cr>')
vim.keymap.set('n', 'dig', 't%vT%d')
vim.keymap.set('n', 'dag', 'f%vF%d')
vim.keymap.set('n', 'cig', 't%vT%c')
vim.keymap.set('n', 'cag', 'f%vF%c')
--" ──>%text%
vim.keymap.set('n', 'viG', '/%<cr>t%vT%<esc>:noh<cr>gv')
vim.keymap.set('n', 'vaG', '/%<cr>vf%<esc>:noh<cr>gv')
vim.keymap.set('n', 'yiG', 'mq/%<cr>t%yT%`q:noh<cr>')
vim.keymap.set('n', 'yaG', 'mq/%<cr>yf%`q:noh<cr>')
vim.keymap.set('n', 'diG', 'mq/%<cr>f%dT%`q:noh<cr>')
vim.keymap.set('n', 'daG', 'mq/%<cr>df%`q:noh<cr>')
vim.keymap.set('n', 'ciG', '/%<cr>t%vT%<esc>:noh<cr>gvc')
vim.keymap.set('n', 'caG', '/%<cr>vf%<esc>:noh<cr>gvc')

vim.keymap.set('n', '<leader>t<', 'va<ovd^va<vd$A><esc>')

-- -- « WRAPPERS »
-- -- ┌──➤ 'Text'
-- nnoremap <leader>i' <Plug>QuoteWordWrap
-- nnoremap <Plug>QuoteWordWrap mqviw<ESC>a'<ESC>bi'<ESC>`q
--     \:call repeat#set("\<Plug>QuoteWordWrap")<CR>

-- nnoremap <leader><leader>i' <Plug>QuoteWORDWrap
-- nnoremap <Plug>QuoteWORDWrap mqviW<ESC>a'<ESC>Bi'<ESC>`q
--     \:call repeat#set("\<Plug>QuoteWORDWrap")<CR>

-- vnoremap <leader>i' <ESC>mq`>a'<ESC>`<<ESC>i'<ESC>`><ESC>`q

-- nnoremap <leader>d' <Plug>QuoteUnwrap
-- nnoremap <Plug>QuoteUnwrap mq/'<cr>x?'<cr>x:noh<cr>`q
--     \:call repeat#set("\<Plug>QuoteUnwrap")<CR>

-- nnoremap <leader>d" <Plug>NextQuoteUnwrap
-- nnoremap <Plug>NextQuoteUnwrap mq/'<cr>x/'<cr>x:noh<cr>`q
--     \:call repeat#set("\<Plug>NextQuoteUnwrap")<CR>

-- vnoremap <leader>d' <esc>mq`>/'<cr>x`<?'<cr>x:noh<cr>`q

-- -- ┌──➤ "Text"
-- nnoremap <leader>i; <Plug>DQuoteWordWrap
-- nnoremap <Plug>DQuoteWordWrap mqviw<ESC>a"<ESC>bi"<ESC>`q
--     \:call repeat#set("\<Plug>DQuoteWordWrap")<CR>

-- nnoremap <leader><leader>i; <Plug>DQuoteWORDWrap
-- nnoremap <Plug>DQuoteWORDWrap mqviW<ESC>a"<ESC>Bi"<ESC>`q
--     \:call repeat#set("\<Plug>DQuoteWORDWrap")<CR>

-- vnoremap <leader>i; <ESC>mq`>a"<ESC>`<<ESC>i"<ESC>`><ESC>`q

-- nnoremap <leader>d; <Plug>DQuoteUnwrap
-- nnoremap <Plug>DQuoteUnwrap mq/"<cr>x?"<cr>x:noh<cr>`q
--     \:call repeat#set("\<Plug>DQuoteUnwrap")<CR>

-- nnoremap <leader>d: <Plug>NextDQuoteUnwrap
-- nnoremap <Plug>NextDQuoteUnwrap mq/"<cr>x/"<cr>x:noh<cr>`q
--     \:call repeat#set("\<Plug>NextDQuoteUnwrap")<CR>

-- vnoremap <leader>d; <esc>mq`>/"<cr>x`<?"<cr>x:noh<cr>`q

-- -- ┌──➤ `Text`
-- nnoremap <leader>i` <Plug>BTickWordWrap
-- nnoremap <Plug>BTickWordWrap mqviw<ESC>a`<ESC>bi`<ESC>`q
--     \:call repeat#set("\<Plug>BTickWordWrap")<CR>

-- nnoremap <leader><leader>i` <Plug>BTickWORDWrap
-- nnoremap <Plug>BTickWORDWrap mqviW<ESC>a`<ESC>Bi`<ESC>`q
--     \:call repeat#set("\<Plug>BTickWORDWrap")<CR>

-- vnoremap <leader>i` <ESC>mq`>a`<ESC>`<<ESC>i`<ESC>`><ESC>`q

-- nnoremap <leader>d` <Plug>BTickUnwrap
-- nnoremap <Plug>BTickUnwrap mq/`<cr>x?`<cr>x:noh<cr>`q
--     \:call repeat#set("\<Plug>BTickUnwrap")<CR>

-- nnoremap <leader>d~ <Plug>NextBTickUnwrap
-- nnoremap <Plug>NextBTickUnwrap mq/`<cr>x/`<cr>x:noh<cr>`q
--     \:call repeat#set("\<Plug>NextBTickUnwrap")<CR>

-- vnoremap <leader>d` <esc>mq`>/`<cr>x`<?`<cr>x:noh<cr>`q

-- -- ┌──➤ %Text%
-- nnoremap <leader>ig <Plug>AHKVarWordWrap
-- nnoremap <Plug>AHKVarWordWrap mqviw<ESC>a%<ESC>bi%<ESC>`q
--     \:call repeat#set("\<Plug>AHKVarWordWrap")<CR>

-- nnoremap <leader><leader>ig <Plug>AHKVarWORDWrap
-- nnoremap <Plug>AHKVarWORDWrap mqviW<ESC>a%<ESC>Bi%<ESC>`q
--     \:call repeat#set("\<Plug>AHKVarWORDWrap")<CR>

-- vnoremap <leader>ig <ESC>mq`>a%<ESC>`<<ESC>i%<ESC>`><ESC>`q

-- nnoremap <leader>dg <Plug>AHKVarUnwrap
-- nnoremap <Plug>AHKVarUnwrap mq/%<cr>x?%<cr>x:noh<cr>`q
--     \:call repeat#set("\<Plug>AHKVarUnwrap")<CR>

-- nnoremap <leader>dG <Plug>NextAHKVarUnwrap
-- nnoremap <Plug>NextAHKVarUnwrap mq/%<cr>x/%<cr>x:noh<cr>`q
--     \:call repeat#set("\<Plug>NextAHKVarUnwrap")<CR>

-- vnoremap <leader>dg <esc>mq`>/%<cr>x`<?%<cr>x:noh<cr>`q

-- -- ┌──➤ (Text)
-- nnoremap <leader>iu <Plug>ParensWordWrap
-- nnoremap <Plug>ParensWordWrap mqviw<ESC>a)<ESC>bi(<ESC>`q
--     \:call repeat#set("\<Plug>ParensWordWrap")<CR>

-- nnoremap <leader><leader>iu <Plug>ParensWORDWrap
-- nnoremap <Plug>ParensWORDWrap mqviW<ESC>a)<ESC>Bi(<ESC>`q
--     \:call repeat#set("\<Plug>ParensWORDWrap")<CR>

-- vnoremap <leader>iu <ESC>mq`>a)<ESC>`<<ESC>i(<ESC>`><ESC>`q

-- nnoremap <leader>du <Plug>ParensUnwrap
-- nnoremap <Plug>ParensUnwrap mqva(o<esc>%x``x`q
--     \:call repeat#set("\<Plug>ParensUnwrap")<CR>

-- nnoremap <leader>di <Plug>NextParensUnwrap
-- nnoremap <Plug>NextParensUnwrap mq/(<cr>va(o<esc>%x``x:noh<cr>`q
--     \:call repeat#set("\<Plug>NextParensUnwrap")<CR>

-- vnoremap <leader>du <esc>mq`>/)<cr>x`<?(<cr>x:noh<cr>`q

-- nnoremap <leader>ru <Plug>ToParensWrap
-- nnoremap <Plug>ToParensWrap mq/[)\]}]<cr>%r(``r):noh<cr>`q
--     \:call repeat#set("\<Plug>ToParensWrap")<CR>

-- nnoremap <leader>ri <Plug>NextToParensWrap
-- nnoremap <Plug>NextToParensWrap mq/[)\]}]<cr>n%r(``r):noh<cr>`q
--     \:call repeat#set("\<Plug>NextToParensWrap")<CR>

-- nnoremap <leader><CR>u <Plug>OutlineWordParensWrap
-- nnoremap <Plug>OutlineWordParensWrap mqviw<ESC>a<CR>)<CR><ESC>`<i<CR>(<CR><ESC>`q
--     \:call repeat#set("\<Plug>OutlineWordParensWrap")<CR>

-- vnoremap <leader><CR>u <ESC>mq`>a<CR>)<ESC>`<i(<CR><ESC>`q

-- nnoremap <leader><CR>i <Plug>OutlineParensWrap
-- nnoremap <Plug>OutlineParensWrap mqO(<ESC>jo)<ESC>`q>>
--     \:call repeat#set("\<Plug>OutlineParensWrap")<CR>

-- vnoremap <leader><CR>i <ESC>mq`<O(<ESC>`>o)<ESC>gv><ESC>`q

-- -- ┌──➤ [Text]
-- nnoremap <leader>i[ <Plug>BracketsWordWrap
-- nnoremap <Plug>BracketsWordWrap mqviw<ESC>a]<ESC>bi[<ESC>`q
--     \:call repeat#set("\<Plug>BracketsWordWrap")<CR>

-- nnoremap <leader><leader>i[ <Plug>BracketsWORDWrap
-- nnoremap <Plug>BracketsWORDWrap mqviW<ESC>a]<ESC>Bi[<ESC>`q
--     \:call repeat#set("\<Plug>BracketsWORDWrap")<CR>

-- vnoremap <leader>i[ <ESC>mq`>a]<ESC>`<<ESC>i[<ESC>`><ESC>`q

-- nnoremap <leader>d[ <Plug>BracketsUnwrap
-- nnoremap <Plug>BracketsUnwrap mqva[o<esc>%x``x`q
--     \:call repeat#set("\<Plug>BracketsUnwrap")<CR>

-- nnoremap <leader>d] <Plug>NextBracketsUnwrap
-- nnoremap <Plug>NextBracketsUnwrap mq/[<cr>va[o<esc>%x``x:noh<cr>`q
--     \:call repeat#set("\<Plug>NextBracketsUnwrap")<CR>

-- vnoremap <leader>d[ <esc>mq`>/]<cr>x`<?[<cr>x:noh<cr>`q

-- nnoremap <leader>r[ <Plug>ToBracketsWrap
-- nnoremap <Plug>ToBracketsWrap mq/[)}]<cr>%r[``r]:noh<cr>`q
--     \:call repeat#set("\<Plug>ToBracketsWrap")<CR>

-- nnoremap <leader>r] <Plug>NextToBracketsWrap
-- nnoremap <Plug>NextToBracketsWrap mq/[)}]<cr>n%r[``r]:noh<cr>`q
--     \:call repeat#set("\<Plug>NextToBracketsWrap")<CR>

-- nnoremap <leader><CR>[ <Plug>OutlineWordBracketsWrap
-- nnoremap <Plug>OutlineWordBracketsWrap mqviw<ESC>a<CR>]<CR><ESC>`<i<CR>[<CR><ESC>`q
--     \:call repeat#set("\<Plug>OutlineWordBracketsWrap")<CR>

-- vnoremap <leader><CR>[ <ESC>mq`>a<CR>]<ESC>`<i[<CR><ESC>`q

-- nnoremap <leader><CR>] <Plug>OutlineBracketsWrap
-- nnoremap <Plug>OutlineBracketsWrap mqO[<ESC>jo]<ESC>`q>>
--     \:call repeat#set("\<Plug>OutlineBracketsWrap")<CR>

-- vnoremap <leader><CR>] <ESC>mq`<O[<ESC>`>o]<ESC>gv><ESC>`q

-- -- ┌──➤ {Text}
-- nnoremap <leader>ij <Plug>BracesWordWrap
-- nnoremap <Plug>BracesWordWrap mqviw<ESC>a}<ESC>bi{<ESC>`q
--     \:call repeat#set("\<Plug>BracesWordWrap")<CR>

-- nnoremap <leader><leader>ij <Plug>BracesWORDWrap
-- nnoremap <Plug>BracesWORDWrap mqviW<ESC>a}<ESC>Bi{<ESC>`q
--     \:call repeat#set("\<Plug>BracesWORDWrap")<CR>

-- vnoremap <leader>ij <ESC>mq`>a}<ESC>`<<ESC>i{<ESC>`><ESC>`q

-- nnoremap <leader>dj <Plug>BracesUnwrap
-- nnoremap <Plug>BracesUnwrap mqva{o<esc>%x``x`q
--     \:call repeat#set("\<Plug>BracesUnwrap")<CR>

-- nnoremap <leader>dk <Plug>NextBracesUnwrap
-- nnoremap <Plug>NextBracesUnwrap mq/{<cr>va{o<esc>%x``x:noh<cr>`q
--     \:call repeat#set("\<Plug>NextBracesUnwrap")<CR>

-- vnoremap <leader>dj <esc>mq`>/}<cr>x`<?{<cr>x:noh<cr>`q

-- nnoremap <leader>rj <Plug>ToBracesWrap
-- nnoremap <Plug>ToBracesWrap mq/[)\]]<cr>%r{``r}:noh<cr>`q
--     \:call repeat#set("\<Plug>ToBracesWrap")<CR>

-- nnoremap <leader>rk <Plug>NextToBracesWrap
-- nnoremap <Plug>NextToBracesWrap mq/[)\]]<cr>n%r{``r}:noh<cr>`q
--     \:call repeat#set("\<Plug>NextToBracesWrap")<CR>

-- nnoremap <leader><CR>j <Plug>OutlineWordBracesWrap
-- nnoremap <Plug>OutlineWordBracesWrap mqviw<ESC>a<CR>}<CR><ESC>`<i<CR>{<CR><ESC>`q
--     \:call repeat#set("\<Plug>OutlineWordBracesWrap")<CR>

-- vnoremap <leader><CR>j <ESC>mq`<O{<ESC>`>o}<ESC>gv><ESC>`q

-- nnoremap <leader><CR>k <Plug>OutlineBracesWrap
-- nnoremap <Plug>OutlineBracesWrap mqO{<ESC>jo}<ESC>`q>>
--     \:call repeat#set("\<Plug>OutlineBracesWrap")<CR>

-- vnoremap <leader><CR>k <ESC>mq`<O{<ESC>`>o}<ESC>gv><ESC>`q

-- -- ┌──➤ { Text }
-- nnoremap <leader>iJ <Plug>SBracesWordWrap
-- nnoremap <Plug>SBracesWordWrap mqviw<ESC>a }<ESC>bi{ <ESC>`q
--     \:call repeat#set("\<Plug>SBracesWordWrap")<CR>

-- nnoremap <leader><leader>iJ <Plug>SBracesWORDWrap
-- nnoremap <Plug>SBracesWORDWrap mqviW<ESC>a }<ESC>Bi{ <ESC>`q
--     \:call repeat#set("\<Plug>SBracesWORDWrap")<CR>

-- vnoremap <leader>iJ <ESC>mq`>a }<ESC>`<<ESC>i{ <ESC>`><ESC>`q

-- nnoremap <leader>dJ <Plug>SBracesUnwrap
-- nnoremap <Plug>SBracesUnwrap mqva{o<esc>%hxx``xx`q
--     \:call repeat#set("\<Plug>SBracesUnwrap")<CR>

-- nnoremap <leader>dK <Plug>NextSBracesUnwrap
-- nnoremap <Plug>NextSBracesUnwrap mq/{<cr>va{o<esc>%hxx``xx:noh<cr>`q
--     \:call repeat#set("\<Plug>NextSBracesUnwrap")<CR>

-- vnoremap <leader>dJ <esc>mq`>/}<cr>hxx`<?<cr>xx:noh<cr>`q

-- -- ┌──➤ ${Text}
-- nnoremap <leader>if <Plug>PlaceholderWordWrap
-- nnoremap <Plug>PlaceholderWordWrap mqviw<ESC>a}<ESC>bi${<ESC>`q
--     \:call repeat#set("\<Plug>PlaceholderWordWrap")<CR>

-- nnoremap <leader><leader>if <Plug>PlaceholderWORDWrap
-- nnoremap <Plug>PlaceholderWORDWrap mqviW<ESC>a}<ESC>Bi${<ESC>`q
--     \:call repeat#set("\<Plug>PlaceholderWORDWrap")<CR>

-- vnoremap <leader>if <ESC>mq`>a}<ESC>`<<ESC>i${<ESC>`><ESC>`q

-- nnoremap <leader>df <Plug>PlaceholderUnwrap
-- nnoremap <Plug>PlaceholderUnwrap mqva{o<esc>%x``xX:noh<cr>`q
--     \:call repeat#set("\<Plug>PlaceholderUnwrap")<CR>

-- nnoremap <leader>dF <Plug>NextPlaceholderUnwrap
-- nnoremap <Plug>NextPlaceholderUnwrap mq/{<cr>va{o<esc>%x``xX:noh<cr>`q
--     \:call repeat#set("\<Plug>NextPlaceholderUnwrap")<CR>

-- vnoremap <leader>df <esc>mq`>/}<cr>x`<?$<cr>xx:noh<cr>`q

-- nnoremap <leader><CR>f <Plug>OutlinePlaceholderWrap
-- nnoremap <Plug>OutlinePlaceholderWrap mqO${<ESC>jo}<ESC>`q>>
--     \:call repeat#set("\<Plug>OutlinePlaceholderWrap")<CR>

-- vnoremap <leader><CR>f <ESC>mq`>a<CR>}<ESC>`<i${<CR><ESC>gv><ESC>`q

-- -- ┌──➤ /Text/
-- nnoremap <leader>i/ <Plug>SlashWordWrap
-- nnoremap <Plug>SlashWordWrap mqviw<ESC>a/<ESC>bi/<ESC>`q
--     \:call repeat#set("\<Plug>SlashWordWrap")<CR>

-- nnoremap <leader><leader>i/ <Plug>SlashWORDWrap
-- nnoremap <Plug>SlashWORDWrap mqviW<ESC>a/<ESC>Bi/<ESC>`q
--     \:call repeat#set("\<Plug>SlashWORDWrap")<CR>

-- vnoremap <leader>i/ <ESC>mq`>a/<ESC>`<<ESC>i/<ESC>`><ESC>`q

-- nnoremap <leader>d/ <Plug>SlashUnwrap
-- nnoremap <Plug>SlashUnwrap mq//<cr>x?/<cr>x:noh<cr>`q
--     \:call repeat#set("\<Plug>SlashUnwrap")<CR>

-- nnoremap <leader>d? <Plug>NextSlashUnwrap
-- nnoremap <Plug>NextSlashUnwrap mq//<cr>nx?/<cr>x:noh<cr>`q
--     \:call repeat#set("\<Plug>NextSlashUnwrap")<CR>

-- vnoremap <leader>d/ <esc>mq`>//<cr>x`<?/<cr>x:noh<cr>`q

-- -- ┌──➤ <Text>
-- nnoremap <leader>i, <Plug>ChevronsWordWrap
-- nnoremap <Plug>ChevronsWordWrap mqviw<ESC>a><ESC>bi<<ESC>`q
--     \:call repeat#set("\<Plug>ChevronsWordWrap")<CR>

-- nnoremap <leader><leader>i, <Plug>ChevronsWORDWrap
-- nnoremap <Plug>ChevronsWORDWrap mqviW<ESC>a><ESC>Bi<<ESC>`q
--     \:call repeat#set("\<Plug>ChevronsWORDWrap")<CR>

-- vnoremap <leader>i, <ESC>mq`>a><ESC>`<<ESC>i<<ESC>`><ESC>`q

-- nnoremap <leader>d, <Plug>ChevronsUnwrap
-- nnoremap <Plug>ChevronsUnwrap mqva<o<esc>va<<esc>x``x:noh<cr>`q
--     \:call repeat#set("\<Plug>ChevronsUnwrap")<CR>

-- nnoremap <leader>d. <Plug>NextChevronsUnwrap
-- nnoremap <Plug>NextChevronsUnwrap mq/<<cr>va<o<esc>va<<esc>x``x:noh<cr>`q
--     \:call repeat#set("\<Plug>NextChevronsUnwrap")<CR>

-- vnoremap <leader>d, <esc>mq`>/><cr>x`<?<<cr>x:noh<cr>`q

-- -- ┌──➤  Text
-- nnoremap <leader>i<leader> <Plug>SpaceWordWrap
-- nnoremap <Plug>SpaceWordWrap mqviw<ESC>a <ESC>bi <ESC>`q
--     \:call repeat#set("\<Plug>SpaceWordWrap")<CR>

-- nnoremap <leader><leader>i<leader> <Plug>SpaceWORDWrap
-- nnoremap <Plug>SpaceWORDWrap mqviw<esc>a <esc>bi <esc>`q
--     \:call repeat#set("\<Plug>SpaceWORDWrap")<CR>

-- vnoremap <leader>i<leader> <ESC>mq`>a <ESC>`<<ESC>i <ESC>`><ESC>`q

-- nnoremap <leader>d<leader> <Plug>SpaceUnwrap
-- nnoremap <Plug>SpaceUnwrap mq/ <cr>x? <cr>x:noh<cr>`q
--     \:call repeat#set("\<Plug>SpaceUnwrap")<CR>

-- vnoremap <leader>d<leader> <esc>mq`>/ <cr>x`<? <cr>x:noh<cr>`q

-- -- ┌──➤  \n
-- --    Text
-- --\n
-- nnoremap <leader>i<CR> <Plug>NewlineWordWrap
-- nnoremap <Plug>NewlineWordWrap viw<ESC>a<CR><ESC>`<i<CR><ESC>
--     \:call repeat#set("\<Plug>NewlineWordWrap")<CR>

-- nnoremap <leader><leader>i<CR> <Plug>NewlineWORDWrap
-- nnoremap <Plug>NewlineWORDWrap viW<ESC>a<CR><ESC>`<i<CR><ESC>
--     \:call repeat#set("\<Plug>NewlineWORDWrap")<CR>

vim.keymap.set('v', '<leader>i<CR>', '<ESC>`>a<CR><ESC>`<i<CR><ESC>')

-- ┌──➤  <>Text</>
vim.keymap.set('n', '<leader>it', 'o</><ESC>kO<><ESC>mqj>>`qi')
vim.keymap.set('v', '<leader>it', '<ESC>`>o</><ESC>`<O<><ESC>mqgv>`qi')
vim.keymap.set('n', '<leader>dt', 'mqvat<`q0i:exe "/^<esc>f<a\\/<esc>/[ >]<cr>i" <esc>"qdF::@q<cr>dd`qdd:noh<cr>')
--""" Note: Your cursor has to be (anywhere) on top of the opening tag and it only works with spreaded tags (not oneliners) in the form:
-- <tag (optional attributes)>
--   (optional content)
--""" </tag>

vim.keymap.set('n', '<leader>;', 'mq$a;<ESC>`q')
vim.keymap.set('n', '<leader>,', 'mq$a,<ESC>`q')
vim.keymap.set('n', '<leader>.', 'mq$a.<ESC>`q')

vim.keymap.set('n', '<leader>l', '$')
vim.keymap.set('n', '<leader>h', '^')
vim.keymap.set('n', '<leader>H', '0')

-- Change inside parens/brackets shortcut [EXPERIMENTAL]
--  onoremap p :<c-u>normal! t)vi(<cr>
--  onoremap P :<c-u>normal! T(vi(<cr>
--  onoremap o :<c-u>normal! t]vi[<cr>
--  onoremap O :<c-u>normal! T[vi[<cr>

vim.keymap.set('n', '<C-a>', 'v<C-a>')
vim.keymap.set('n', '<C-x>', 'v<C-x>')

vim.keymap.set('n', '{', '/^%s*$<cr>:noh<cr>')
vim.keymap.set('n', '}', '?^%s*$<cr>:noh<cr>')
vim.keymap.set('o', '{', '}')
vim.keymap.set('o', '}', '{')
vim.keymap.set('v', '{', '}')
vim.keymap.set('v', '}', '{')
vim.keymap.set('n', ')', '/[)}%]]<cr>:noh<cr>')
vim.keymap.set('n', '(', '?[({%]<cr>:noh<cr>')
vim.keymap.set('v', ')', '/[)}%]]<cr>')
vim.keymap.set('v', '(', '?[({[]<cr>')

-- nnoremap <leader>^ :call AddTwoSlashQuery()<cr>
-- function! AddTwoSlashQuery()
--     let l:startPos = getcurpos()
--     let l:col = l:startPos[2]
--     let l:currentLine = l:startPos[1]
--     let l:indent = indent(l:currentLine)
--     let l:query = repeat(" ", l:indent) . "//" . repeat(" ", l:col - l:indent - 3) . "^?"
--     let l:failed = append(l:currentLine, l:query)
--     if failed
--         echom "Unable to add TwoSlashQuery after line: " . l:currentLine
--     endif
-- endfunction

-- Format into multiple lines <EXPERIMENTAL>
vim.keymap.set('n', '<leader>=', 'vi(o<esc>i<cr><esc>vi(<esc>a<cr><esc>k:s/,%s%?/,\r/g<cr>:noh<cr>')

-- Add Markdown checklist to lines
vim.keymap.set('n', '<leader>ix', 'mqI - [ ] <esc>`q:noh<cr>')
vim.keymap.set('n', '<leader>dx', 'mq:s/ - %[.%] <cr>`q:noh<cr>')
vim.keymap.set('v', '<leader>ix', '<esc>mqgv^o^<c-v>I - [ ] <esc>`q:noh<cr>')
vim.keymap.set('v', '<leader>dx', '<esc>mqgv:s/ - %[.%] <cr>`q:noh<cr>')

-- Toggle capitalization of first letter of word
vim.keymap.set('n', '<leader>~', 'mqviwo<esc>~`q')

-- Calculate written operation (doesn't work in VSCode)
vim.keymap.set('v', '<localleader>c', 's<c-r>=<c-r>"<cr><esc>')

-- Wrap with console print function

-- Source or edit config file
vim.keymap.set('n', '<localleader><localleader>s', ':source C:\\Users\\Moiso\\rc\\vim_init.lua<cr>')
vim.keymap.set('n', '<localleader><localleader>e', ':e C:\\Users\\Moiso\\rc\\vim_init.vim<cr>')


-- ====================== VSCode only begin ===================

-- VSCode needs double backlash (\\) for the OR operator for some unkown reason...
vim.keymap.set('n', 'dix', '/,\\|)\\|}\\|]\\|%s}<cr>d?,<cr>:noh<cr>')
vim.keymap.set('n', 'diX', 'mq/,<cr>lv`q?(\\|%[\\|{<cr>wd:noh<cr>')
vim.keymap.set('n', 'cix', '/,\\|)\\|}\\|]\\|%s}<cr>hv?,<cr>wv:noh<cr>gvc')
vim.keymap.set('n', 'ciX', 'mq/,<cr>lv`q?(\\|%[\\|{<cr>v:noh<cr>gvwc')

-- ===================== VSCode only end =======================


-- ============================ TESTS =================================
--augroup test_js
--	au!
--	au FileType javascript nnoremap <buffer> <localleader>c iasdfjkl;<ESC>
--augroup END

-- nnoremap <localleader><localleader>p :call InsertPrintFunction("w")<cr>
-- function! InsertPrintFunction(x)
--     let extension = expand('%:e')

--     " Python
--     if extension =~# "py"
--         exec "normal! vi" . a:x . "\<ESC>a)\<ESC>biprint(\<ESC>%"

--     " Javascript
--     elseif extension =~# "^js" || "^ts"
--         exec "normal! vi" . a:x . "\<ESC>a)\<ESC>biconsole.log(\<ESC>%"

--     " Rust
--     elseif extension ==# "rs"
--         exec "normal! vi" . a:x . "\<ESC>a)\<ESC>biprintln!(\"{}\", \<ESC>f)"
--     else
--         echo "###   « Mi ne rekonas ĉi tiun dosiertipon... »   ###"
--     endif
-- endfunction

-- function! EnumSubtitleLines()
--     let line = 1

--     while line < 5000
--         try
--             exec "normal! /^$\<CR>"
--         catch /.*/
--             break
--         endtry
--         exec "normal! s" . line . "\<ESC>"
--         let line += 1
--     endwhile

--     " Add newline before the added numbers
--     exec "normal! :%s/^\\(\\d*\\)$/\\r\\1/g\<CR>:noh\<CR>"
--     echo "Linioj nombritaj :)"
-- endfunction
--

vim.api.nvim_command('echo "Neovim config sourced!"')
