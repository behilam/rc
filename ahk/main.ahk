#NoEnv
SendMode Input
SetWorkingDir %A_ScriptDir%
#MenuMaskKey vkFF
#SingleInstance,Force
#MaxHotkeysPerInterval 180
#MaxThreadsPerHotkey 5
; #Warn ; Enable warnings to assist with detecting common errors.

; Current layout
; ┌───┐   ┌───┬───┬───┬───┐ ┌───┬───┬───┬───┐ ┌───┬───┬───┬───┐ ┌───┬───┬───┐
; │ESC│   │F1 │F2 │F3 │F4 │ │F5 │F6 │F7 │F8 │ │F9 │F10│F11│F12│ │Scr│SLo│Pau│
; └───┘   └───┴───┴───┴───┘ └───┴───┴───┴───┘ └───┴───┴───┴───┘ └───┴───┴───┘
; ┌───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───────┐ ┌───┬───┬───┐ ┌───┬───┬───┬───┐
; │CAP│ 1 │ 2 │ 3 │ 4 │ 5 │ 6 │ 7 │ 8 │ 9 │ 0 │ - │ = │  <——  │ │Ins│Hom│PgU│ │Num│ / │ * │ - │
; ├───┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─────┤ ├───┼───┼───┤ ├───┼───┼───┼───┤
; │ Tab │ [ │ q │ w │ e │ r │ t │ y │ u │ i │ o │ p │ ] │ <─┘ │ │Del│End│PgD│ │ 7 │ 8 │ 9 │   │
; ├─────┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┐   │ └───┴───┴───┘ ├───┼───┼───┤ + │
; │   \   │ / │ a │ s │ d │ f │ g │ h │ j │ k │ l │ ; │ ' │   │               │ 4 │ 5 │ 6 │   │
; ├────┬──┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴───┴───┤     ┌───┐     ├───┼───┼───┼───┤
; │ L↑ │SLoc│ ` │ z │ x │ c │ v │ b │ n │ m │ , │ . │   R↑    │     │ ↑ │     │ 1 │ 2 │ 3 │   │
; ├────┼────┼───┴─┬─┴───┴───┴───┴───┴───┴─┬─┴──┬┴───┼────┬────┤ ┌───┼───┼───┐ ├───┴───┼───┤ ┐ │
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
; ├────┬──┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴─┬─┴───┴───┤     ┌───┐     ├───┼───┼───┼───┤
; │ L↑ │SLoc│ z │ x │ c │ v │ b │ n │ m │ , │ . │ / │   R↑    │     │ ↑ │     │ 1 │ 2 │ 3 │   │
; ├────┼────┼───┴─┬─┴───┴───┴───┴───┴───┴─┬─┴──┬┴───┼────┬────┤ ┌───┼───┼───┐ ├───┴───┼───┤ ┐ │
; │LCtr│Win │LAlt │         └───┘         │RAlt│ Fn │Apps│RCtr│ │ ← │ ↓ │ → │ │   0   │ . │ V │
; └────┴────┴─────┴───────────────────────┴────┴────┴────┴────┘ └───┴───┴───┘ └───────┴───┴───┘

; =======================
; =====  VARIABLES  =====
; =======================
CurrentWin := "test"
AudioDeviceCounter := False
Clipstack := []
temp := ""

Mouse_gotoX := 0
Mouse_gotoY := 0
LClickIndex := 1
LClickStack := []
LBtnResetable := true

Mouse2_gotoX := 0
Mouse2_gotoY := 0
RClickIndex := 1
RClickStack := []
RBtnResetable := true

^#!r::Reload

ShowTooltip(text, timeMs := -1000) {
    Tooltip, %text%
    SetTimer, RemoveToolTip, %timeMs%
}

RemoveToolTip() {
    ToolTip
}

; =======================
; =====  KEYBOARD  ======
; =======================
#Enter::Click

; Special number characters
Appskey & a::!
Appskey & s::@
Appskey & d::#
Appskey & f::$
Appskey & g::Send, `%
Appskey & q::^
Appskey & w::&
Appskey & e::*
Appskey & r::(
Appskey & t::)

; Brakets
Appskey & u::(
Appskey & i::)
Appskey & j::{
Appskey & k::}

; Quick numbers
>^a::Send, 1
>^s::Send, 2
>^d::Send, 3
>^f::Send, 4
>^g::Send, 5
>^q::Send, 6
>^w::Send, 7
>^e::Send, 8
>^r::Send, 9
>^t::Send, 0

; Tab movements
>^j::Send, ^1
>^k::Send, ^2
>^l::Send, ^3
>^`;::Send, ^4
>^'::Send, ^5
>^u::Send, ^6
>^i::Send, ^7
>^o::Send, ^8
>^p::Send, ^9
>^]::Send, ^0

; Box drawing
NumpadEnd::Send, % (Chr(9492))
NumpadDown::Send, % (Chr(9524))
NumpadPgdn::Send, % (Chr(9496))
NumpadLeft::Send, % (Chr(9500))
NumpadClear::Send, % (Chr(9532))
NumpadRight::Send, % (Chr(9508))
NumpadHome::Send, % (Chr(9484))
NumpadUp::Send, % (Chr(9516))
NumpadPgup::Send, % (Chr(9488))
NumpadSub::
    if (GetKeyState("NumLock", "T"))
        Send, -
    else
        Send, % (Chr(9472))
Return
NumpadAdd::
    if (GetKeyState("NumLock", "T"))
        Send, {+}
    else
        Send, % (Chr(9474))
Return

; ===============================================================
; ===============         OTHER FUNCTIONS         ===============
; ===============================================================

; ; Change Audio Device
; +F1::
;     If (AudioDeviceCounter) {
;         AudioDeviceCounter := False
;         ; VA_SetDefaultEndpoint("Speakers (3- High Definition Audio Device)", 0)
;         VA_SetDefaultEndpoint("Altavoces (4- High Definition Audio Device)", 0)
;         ; VA_SetDefaultEndpoint("Speakers (Realtek(R) Audio)", 0)
;         ; VA_SetDefaultEndpoint("Speakers (2- Realtek(R) Audio)", 0)
;     } else {
;         AudioDeviceCounter := True
;         ; VA_SetDefaultEndpoint("ASUS VP228", 0)
;         ; VA_SetDefaultEndpoint("Speakers (8- Logitech G533 Gaming Headset)", 0)
;         VA_SetDefaultEndpoint("Speakers (Logitech G533 Gaming Headset)", 0)
;     }
; Return

; Alternative left-hand Media shortcuts
#q::Media_Play_Pause
#z::Media_Next
#`::Media_Prev
#[::Volume_Up
#/::Volume_Down

; AutoClick in VRChat
#IfWinActive, VRChat
    F13::
        Send, {LShift down}{F1 down}
        Sleep, 200
        Send, {LShift up}{F1 up}
    Return
    F14::
        Send, {LShift down}{F2 down}
        Sleep, 200
        Send, {LShift up}{F2 up}
    Return
    F15::
        Send, {LShift down}{F3 down}
        Sleep, 200
        Send, {LShift up}{F3 up}
    Return
    F16::
        Send, {LShift down}{F4 down}
        Sleep, 200
        Send, {LShift up}{F4 up}
    Return
    F17::
        Send, {LShift down}{F5 down}
        Sleep, 200
        Send, {LShift up}{F5 up}
    Return
    F18::
        Send, {LShift down}{F6 down}
        Sleep, 200
        Send, {LShift up}{F6 up}
    Return
    F19::
        Send, {LShift down}{F7 down}
        Sleep, 200
        Send, {LShift up}{F7 up}
    Return
    F20::
        Send, {LShift down}{F8 down}
        Sleep, 200
        Send, {LShift up}{F8 up}
    Return

    +F13::
        Send, {RShift down}{LShift down}{F1 down}
        Sleep, 200
        Send, {RShift up}{LShift up}{F1 up}
    Return
    +F14::
        Send, {RShift down}{LShift down}{F2 down}
        Sleep, 200
        Send, {RShift up}{LShift up}{F2 up}
    Return
    +F15::
        Send, {RShift down}{LShift down}{F3 down}
        Sleep, 200
        Send, {RShift up}{LShift up}{F3 up}
    Return
    +F16::
        Send, {RShift down}{LShift down}{F4 down}
        Sleep, 200
        Send, {RShift up}{LShift up}{F4 up}
    Return
    +F17::
        Send, {RShift down}{LShift down}{F5 down}
        Sleep, 200
        Send, {RShift up}{LShift up}{F5 up}
    Return
    +F18::
        Send, {RShift down}{LShift down}{F6 down}
        Sleep, 200
        Send, {RShift up}{LShift up}{F6 up}
    Return
    +F19::
        Send, {RShift down}{LShift down}{F7 down}
        Sleep, 200
        Send, {RShift up}{LShift up}{F7 up}
    Return
    +F20::
        Send, {RShift down}{LShift down}{F8 down}
        Sleep, 200
        Send, {RShift up}{LShift up}{F8 up}
    Return
#IfWinActive

; AutoClick in Morrowind
#IfWinActive, Morrowind
    Enter::SendEvent, {Click}
#IfWinActive

; ###########################
; ##   Private Clipboard   ##
; ###########################

; Copy into Clipstack
<!#c::
    temp := ClipboardAll
    Send, ^c
    ClipWait, 1
    Clipstack.Push(Clipboard)
    Clipboard := temp
    temp := ""
Return

; Paste pop
<!#v::
    temp := ClipboardAll
    Clipboard := Clipstack.Pop()
    Send, ^v
    Clipboard := temp
    temp := ""
Return

;Paste shift
<!#b::
    temp := ClipboardAll
    Clipboard := Clipstack.RemoveAt(1)
    Send, ^v
    Clipboard := temp
    temp := ""
Return

#Include mouse.ahk
#Include unicode.ahk
