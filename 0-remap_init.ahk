#NoEnv  ; Recommended for performance and compatibility with future AutoHotkey releases.
; #Warn  ; Enable warnings to assist with detecting common errors.
SendMode Input  ; Recommended for new scripts due to its superior speed and reliability.
SetWorkingDir %A_ScriptDir%  ; Ensures a consistent starting directory.
#MenuMaskKey vkFF
#SingleInstance,Force
#MaxHotkeysPerInterval 180
; #UseHook On
#MaxThreadsPerHotkey 5

; Current layout
; ┌───┐   ┌───┬───┬───┬───┐ ┌───┬───┬───┬───┐ ┌───┬───┬───┬───┐ ┌───┬───┬───┐
; │ESC│   │F1 │F2 │F3 │F4 │ │F5 │F6 │F7 │F8 │ │F9 │F10│F11│F12│ │Scr│Blo│Pau│
; └───┘   └───┴───┴───┴───┘ └───┴───┴───┴───┘ └───┴───┴───┴───┘ └───┴───┴───┘
; ┌───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───────┐ ┌───┬───┬───┐ ┌───┬───┬───┬───┐
; │CAP│ 1 │ 2 │ 3 │ 4 │ 5 │ 6 │ 7 │ 8 │ 9 │ 0 │ - │ = │  <——  │ │Ins│Hom│PgU│ │Num│ / │ * │ - │
; ├───┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─────┤ ├───┼───┼───┤ ├───┼───┼───┼───┤
; │ Tab │ [ │ q │ w │ e │ r │ t │ y │ u │ i │ o │ p │ ] │ <─┘ │ │Del│End│PgD│ │ 7 │ 8 │ 9 │   │
; ├─────┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┐   │ └───┴───┴───┘ ├───┼───┼───┤ + │
; │   \   │ / │ a │ s │ d │ f │ g │ h │ j │ k │ l │ ; │ ' │   │               │ 4 │ 5 │ 6 │   │
; ├───────┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴───┴───┤     ┌───┐     ├───┼───┼───┼───┤
; │   L↑    │ ` │ z │ x │ c │ v │ b │ n │ m │ , │ . │   R↑    │     │ ↑ │     │ 1 │ 2 │ 3 │   │
; ├────┬────┼───┴─┬─┴───┴───┴───┴───┴───┴─┬─┴──┬┴───┼────┬────┤ ┌───┼───┼───┐ ├───┴───┼───┤ ┐ │
; │LCtr│Win │LAlt │         └───┘         │ L↑ │ Fn │Apps│RCtr│ │ ← │ ↓ │ → │ │   0   │ . │ V │
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

; =======================
; =====  VARIABLES  =====
; =======================
CurrentWin := "test"
AudioDeviceCounter := False
Mouse_gotoX := 0
Mouse_gotoY := 0
Mouse2_gotoX := 0
Mouse2_gotoY := 0
Clipstack := []
temp := ""

; =======================
; =======  MOUSE  =======
; =======================
XButton1::Browser_Back
XButton1 & LButton::Media_Next
XButton1 & RButton::Media_Prev
XButton1 & MButton::Media_Play_Pause
XButton1 & WheelDown::Volume_Down
XButton1 & WheelUp::Volume_Up

XButton2::Browser_Forward
XButton2 & LButton::Send, +{LButton}
XButton2 & MButton::Send, ^{F4}
XButton2 & WheelDown::Send, ^{Tab}
XButton2 & WheelUp::Send, ^+{Tab}

    ; Mouse save location and quick go to location
^#LButton::
    CoordMode, Mouse, Screen
    MouseGetPos, Mouse_gotoX, Mouse_gotoY
Return
#LButton::
    CoordMode, Mouse, Screen
    MouseMove, Mouse_gotoX, Mouse_gotoY
    Sleep 10
    Click
Return
; V ;
^#RButton::
    BlockInput On
    CoordMode, Mouse, Screen
    MouseGetPos, Mouse2_gotoX, Mouse2_gotoY
    Sleep 75
    BlockInput Off
Return
#RButton::
    BlockInput On
    CoordMode, Mouse, Screen
    MouseMove, Mouse2_gotoX, Mouse2_gotoY
    Sleep 75
    Click
    BlockInput Off
Return

; =======================
; =====  KEYBOARD  ======
; =======================
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

; Special number characters
Appskey & s::!
Appskey & d::@
Appskey & f::#
Appskey & g::$
Appskey & h::Send, `%
Appskey & w::^
Appskey & e::&
Appskey & r::*
Appskey & t::(
Appskey & y::)

; Brakets
Appskey & i::(
Appskey & o::)
Appskey & k::{
Appskey & l::}
; Appskey & m::{
; Appskey & ,::}

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
NumpadEnd::└
NumpadDown::┴
NumpadPgdn::┘
NumpadLeft::├
NumpadClear::┼
NumpadRight::┤
NumpadHome::┌
NumpadUp::┬
NumpadPgup::┐
NumpadSub::
    if (GetKeyState("NumLock", "T"))  ; get the toggle-state of NumLock
        Send, -
    else
        Send, ─
Return
NumpadAdd::
    if (GetKeyState("NumLock", "T"))  ; get the toggle-state of NumLock
        Send, {+}
    else
        Send, │
Return


; ===============================================================
; ===============         OTHER FUNCTIONS         ===============
; ===============================================================

; Change Audio Device
+F1::
If (AudioDeviceCounter) {
    AudioDeviceCounter := False
    ; VA_SetDefaultEndpoint("Speakers (3- High Definition Audio Device)", 0)
    VA_SetDefaultEndpoint("Altavoces (4- High Definition Audio Device)", 0)
    ; VA_SetDefaultEndpoint("Speakers (Realtek(R) Audio)", 0)
    ; VA_SetDefaultEndpoint("Speakers (2- Realtek(R) Audio)", 0)
} else {
    AudioDeviceCounter := True
    VA_SetDefaultEndpoint("ASUS VP228", 0)
}
Return

; Alternative left-hand Media shortcuts
#w::Media_Play_Pause ; #q
#x::Media_Next ; #z
#z::Media_Prev ; #`
#q::Volume_Up ; #[
#a::Volume_Down ; #/

; AutoClick in Morrowind
#IfWinActive, Morrowind
Enter::SendEvent, {Click}
#IfWinActive

; ###########################
; ##   Private Clipboard   ##
; ###########################

; Copy into Clipstack
<!#v::
    temp := ClipboardAll
    Send, ^c
    ClipWait, 1
    Clipstack.Push(Clipboard)
    Clipboard := temp
    temp := ""
Return

; Paste pop
<!#b::
    temp := ClipboardAll
    Clipboard := Clipstack.Pop()
    Send, ^v
    Clipboard := temp
    temp := ""
Return

;Paste shift
<!#n::
    temp := ClipboardAll
    Clipboard := Clipstack.RemoveAt(1)
    Send, ^v
    Clipboard := temp
    temp := ""
Return
