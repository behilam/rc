#NoEnv  ; Recommended for performance and compatibility with future AutoHotkey releases.
; #Warn  ; Enable warnings to assist with detecting common errors.
SendMode Input  ; Recommended for new scripts due to its superior speed and reliability.
SetWorkingDir %A_ScriptDir%  ; Ensures a consistent starting directory.
#SingleInstance,Force

; First row
q::[
w::q
e::w
r::e
t::r
y::t
u::y
i::u
o::i
p::o
[::p

; Second Row
a::/
s::a
d::s
f::d
g::f
h::g
j::h
k::j
l::k
`;::l
'::`;
\::'

; Third Row
z::\
x::z
c::x
v::c
b::v
n::b
m::n
,::m
.::,
/::.

; Fourth row
LWin::LCtrl
LCtrl::LWin
RAlt::LShift


; Box drawing
NumpadEnd::Send, └
NumpadDown::Send, ┴
NumpadPgdn::Send, ┘
NumpadLeft::Send, ├
NumpadClear::Send, ┼
NumpadRight::Send, ┤
NumpadHome::Send, ┌
NumpadUp::Send, ┬
NumpadPgup::Send, ┐
NumpadSub::
  if (GetKeyState("NumLock", "T"))  ; get the toggle-state of NumLock
      Send, -
  else
      Send, ─
  return
NumpadAdd::
  if (GetKeyState("NumLock", "T"))  ; get the toggle-state of NumLock
      Send, +
  else
      Send, │
  return

CapsLock::`
`::CapsLock







