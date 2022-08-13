# ~\.bashrc: executed by bash(1) for non-login shells.
# see \usr\share\doc\bash\examples\startup-files (in the package bash-doc)
# for examples

# If not running interactively, don't do anything
case $- in
    *i*) ;;
      *) return;;
esac

alias so=". ~/.bashrc; echo 'bashrc ĝisdata!'"
alias rc="code ~/rc"
alias brc="code ~/.bashrc"
alias cm="cmatrix -b -a -u 5 -s"
alias ..="cd .."
alias ...="cd ../.."
alias ....="cd ../../.."
alias .....="cd ../../../.."
alias cdw="cd $(echo '$1' | sed -e 's/\\/\//g' | sed -e 's/C:/c:/')"
alias pwc="pwd | clip; echo 'copied to clipboard!'"
alias pn="pnpm"
alias g="git"
alias c="cargo"
alias v="nvim"


# enable color support of ls and also add handy aliases
alias ls='ls --color=auto'
alias dir='dir --color=auto'
alias vdir='vdir --color=auto'

alias grep='grep --color=auto'
alias fgrep='fgrep --color=auto'
alias egrep='egrep --color=auto'

# some more ls aliases
alias ll='ls -alF'
alias la='ls -A'
alias l='ls -CF'

# Alias definitions.
# You may want to put all your additions into a separate file like
# ~/.bash_aliases, instead of adding them here directly.
# See /usr/share/doc/bash-doc/examples in the bash-doc package.

if [ -f ~/.bash_aliases ]; then
    . ~/.bash_aliases
fi

eval "$(zoxide init bash)"

e() {
    if [ $1 ] ; then
    explorer $1
    else
    explorer .
    fi
}

wtd() {
    if [ $1 ] ; then
    wt -d $1
    else
    wt -d .
    fi
}

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

