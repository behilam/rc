#NoEnv  ; Recommended for performance and compatibility with future AutoHotkey releases.
; #Warn  ; Enable warnings to assist with detecting common errors.
SendMode Input  ; Recommended for new scripts due to its superior speed and reliability.
SetWorkingDir %A_ScriptDir%  ; Ensures a consistent starting directory.
#SingleInstance,Force

; Current layout
; ┌───┐   ┌───┬───┬───┬───┐ ┌───┬───┬───┬───┐ ┌───┬───┬───┬───┐ ┌───┬───┬───┐
; │ESC│   │F1 │F2 │F3 │F4 │ │F5 │F6 │F7 │F8 │ │F9 │F10│F11│F12│ │Scr│Blo│Pau│
; └───┘   └───┴───┴───┴───┘ └───┴───┴───┴───┘ └───┴───┴───┴───┘ └───┴───┴───┘
; ┌───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───────┐ ┌───┬───┬───┐ ┌───┬───┬───┬───┐
; │CAP│ 1 │ 2 │ 3 │ 4 │ 5 │ 6 │ 7 │ 8 │ 9 │ 0 │ - │ = │  <——  │ │Ins│Hom│PgU│ │Num│ / │ * │ - │
; ├───┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─────┤ ├───┼───┼───┤ ├───┼───┼───┼───┤
; │ Tab │ [ │ q │ w │ e │ r │ t │ y │ u │ i │ o │ p │ ] │ <─┘ │ │Del│End│PgD│ │ 7 │ 8 │ 9 │   │
; ├─────┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┐   │ └───┴───┴───┘ ├───┼───┼───┤ + │
; │   `   │ / │ a │ s │ d │ f │ g │ h │ j │ k │ l │ ; │ ' │   │               │ 4 │ 5 │ 6 │   │
; ├───────┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴───┴───┤     ┌───┐     ├───┼───┼───┼───┤
; │   L↑    │ \ │ z │ x │ c │ v │ b │ n │ m │ , │ . │   R↑    │     │ ↑ │     │ 1 │ 2 │ 3 │   │
; ├────┬────┼───┴─┬─┴───┴───┴───┴───┴───┴─┬─┴──┬┴───┼────┬────┤ ┌───┼───┼───┐ ├───┴───┼───┤ ┐ │
; │Win │LCtr│LAlt │         └───┘         │ L↑ │ Fn │Apps│RCtr│ │ ← │ ↓ │ → │ │   0   │ . │ V │
; └────┴────┴─────┴───────────────────────┴────┴────┴────┴────┘ └───┴───┴───┘ └───────┴───┴───┘

; Original English layout
; ┌───┐   ┌───┬───┬───┬───┐ ┌───┬───┬───┬───┐ ┌───┬───┬───┬───┐ ┌───┬───┬───┐
; │ESC│   │F1 │F2 │F3 │F4 │ │F5 │F6 │F7 │F8 │ │F9 │F10│F11│F12│ │Scr│Blo│Pau│
; └───┘   └───┴───┴───┴───┘ └───┴───┴───┴───┘ └───┴───┴───┴───┘ └───┴───┴───┘
; ┌───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───────┐ ┌───┬───┬───┐ ┌───┬───┬───┬───┐
; │ ` │ 1 │ 2 │ 3 │ 4 │ 5 │ 6 │ 7 │ 8 │ 9 │ 0 │ - │ = │  <——  │ │Ins│Hom│PgU│ │Num│ / │ * │ - │
; ├───┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─────┤ ├───┼───┼───┤ ├───┼───┼───┼───┤
; │ Tab │ q │ w │ e │ r │ t │ y │ u │ i │ o │ p │ [ │ ] │ <─┘ │ │Del│End│PgD│ │ 7 │ 8 │ 9 │   │
; ├─────┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┐   │ └───┴───┴───┘ ├───┼───┼───┤ + │
; │  CAP  │ a │ s │ d │ f │ g │ h │ j │ k │ l │ ; │ ' │ \ │   │               │ 4 │ 5 │ 6 │   │
; ├───────┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴───┴───┤     ┌───┐     ├───┼───┼───┼───┤
; │   L↑    │ z │ x │ c │ v │ b │ n │ m │ , │ . │ / │   R↑    │     │ ↑ │     │ 1 │ 2 │ 3 │   │
; ├────┬────┼───┴─┬─┴───┴───┴───┴───┴───┴─┬─┴──┬┴───┼────┬────┤ ┌───┼───┼───┐ ├───┴───┼───┤ ┐ │
; │LCtr│Win │LAlt │         └───┘         │RAlt│ Fn │Apps│RCtr│ │ ← │ ↓ │ → │ │   0   │ . │ V │
; └────┴────┴─────┴───────────────────────┴────┴────┴────┴────┘ └───┴───┴───┘ └───────┴───┴───┘

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







