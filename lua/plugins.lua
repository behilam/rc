-- This file can be loaded by calling `lua require('plugins')` from your init.vim

-- Only required if you have packer configured as `opt`
vim.cmd [[packadd packer.nvim]]

vim.api.nvim_command('echom "Plugins loading!"');
return require('packer').startup(function(use)
  use 'tpope/vim-repeat';
  use 'ggandor/lightspeed.nvim';
  use 'terryma/vim-expand-region';
  use {
    'glacambre/firenvim',
    run = function() vim.fn['firenvim#install'](0) end
  };

  vim.api.nvim_command('echom "Plugins loaded!"');
end)
