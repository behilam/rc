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
; │LAlt│LCtr│LWin │         └───┘         │ L↑ │ Fn │Apps│RCtr│ │ ← │ ↓ │ → │ │   0   │ . │ V │
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

; Number row
`::CapsLock

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
CapsLock::\
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
z::`
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
LCtrl::LAlt
LWin::LCtrl
LAlt::LWin
RAlt::LShift


; Special number characters
Appskey & s::Send, {!}
Appskey & d::Send, @
Appskey & f::Send, {#}
Appskey & g::Send, $
Appskey & h::Send, `%
Appskey & w::Send, {^}
Appskey & e::Send, &
Appskey & r::Send, *
Appskey & t::Send, (
Appskey & y::Send, )
Appskey & i::Send, -
Appskey & o::Send, {+}
Appskey & p::Send, _
Appskey & [::Send, =

; Quick numbers
>^s::Send, 1
>^d::Send, 2
>^f::Send, 3
>^g::Send, 4
>^h::Send, 5
>^w::Send, 6
>^e::Send, 7
>^r::Send, 8
>^t::Send, 9
>^y::Send, 0

; Tab movements
>^k::Send, ^1
>^l::Send, ^2
>^`;::Send, ^3
>^'::Send, ^4
>^\::Send, ^5
>^i::Send, ^6
>^o::Send, ^7
>^p::Send, ^8
>^[::Send, ^9
>^]::Send, ^0

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
Return
NumpadAdd::
    if (GetKeyState("NumLock", "T"))  ; get the toggle-state of NumLock
        Send, +
    else
        Send, │
Return

