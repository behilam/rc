#NoEnv ; Recommended for performance and compatibility with future AutoHotkey releases.
; #Warn  ; Enable warnings to assist with detecting common errors.
SendMode Input ; Recommended for new scripts due to its superior speed and reliability.
SetWorkingDir %A_ScriptDir% ; Ensures a consistent starting directory.
#MenuMaskKey vkFF
#SingleInstance,Force
#MaxHotkeysPerInterval 180
; #UseHook On
#MaxThreadsPerHotkey 5

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
; =======  MOUSE  =======
; =======================
; Mouse 6
XButton1 & LButton::Media_Next
XButton1 & RButton::Media_Prev
XButton1 & MButton::Media_Play_Pause
XButton1 & WheelDown::Volume_Down
XButton1 & WheelUp::Volume_Up
; XButton1 & F18::
; ^XButton1::
; !XButton1::
; ^!XButton1::
XButton1::
    ; LButton & Mouse_6
    ; if (GetKeyState("LButton", "P")) {
    ;     Return
    ; }

    ; F18 & Mouse_6
    ; if (GetKeyState("F18", "P")) {
    ;     Return
    ; }

    Send, {Browser_Back}
Return

; Mouse 3
; XButton2 & LButton::
; XButton2 & RButton::
XButton2 & MButton::Send, ^{F4}
XButton2 & WheelDown::Send, ^{Tab}
XButton2 & WheelUp::Send, ^+{Tab}
; XButton2 & F18::
; ^XButton2::
; !XButton2::
; ^!XButton2::
XButton2::
    ; LButton & Mouse_3
    ; if (GetKeyState("LButton", "P")) {
    ;     Return
    ; }

    ; F18 & Mouse_3
    ; if (GetKeyState("F18", "P")) {
    ;     Return
    ; }

    Send, {Browser_Forward}
Return

; Mouse 4
F14 & LButton::^c
F14 & RButton::^v
F14 & WheelDown::Down
F14 & WheelUp::Up
; F14 & MButton::
; F14 & F18::
; ^F14::
; !F14::
; ^!F14::
F14::
    ; LButton & Mouse_4
    ; if (GetKeyState("LButton", "P")) {
    ;     Return
    ; }

    ; F18 & Mouse_4
    ; if (GetKeyState("F18", "P")) {
    ;     Return
    ; }

    Send, {Browser_Back}
Return

; Mouse 5
F15 & LButton::^x
F15 & RButton::Delete
F15 & WheelDown::Right
F15 & WheelUp::Left
; F15 & MButton::
; F15 & F18::
; ^F15::
; !F15::
; ^!F15::
; F15::
; LButton & Mouse_5
; if (GetKeyState("LButton", "P")) {
;     Return
; }

; F18 & Mouse_5
; if (GetKeyState("F18", "P")) {
;     Return
; }

;     Send, x
; Return

; Mouse 8
F16 & LButton::^z
F16 & RButton::^+z
; F16 & WheelDown::
; F16 & WheelUp::
; F16 & MButton::
; F16 & F18::
; ^F16::
; !F16::
; ^!F16::
F16::
    ; LButton & Mouse_8
    if (GetKeyState("LButton", "P")) {
        Send, {Esc}
        Return
    }

    ; F18 & Mouse_8
    ; if (GetKeyState("F18", "P")) {
    ;     Return
    ; }

    Send, F16
Return

; Mouse 9
F17 & LButton::^a
; F17 & RButton::
; F17 & WheelDown::
; F17 & WheelUp::
; F17 & MButton::
; F17 & F18::
; ^F17::
; !F17::
; ^!F17::
; F17::
; LButton & Mouse_9
; if (GetKeyState("LButton", "P")) {
;     Return
; }

; F18 & Mouse_9
; if (GetKeyState("F18", "P")) {
;     Return
; }

;     Send, x
; Return

; Mouse save location and quick go to location
^#LButton::
    if LBtnResetable {
        LClickStack := []
        LClickIndex := 1
        LBtnResetable := false
    }
    CoordMode, Mouse, Screen
    MouseGetPos, Mouse2_gotoX, Mouse2_gotoY
    LClickStack.Push([Mouse2_gotoX, Mouse2_gotoY])
Return
#LButton::
    LBtnResetable := true
    CoordMode, Mouse, Screen
    MouseMove, LClickStack[LClickIndex][1], LClickStack[LClickIndex][2]
    LClickIndex := Mod(LClickIndex, LClickStack.Length()) + 1
    Sleep 10
    Click
Return
; V ;
^#RButton::
    if RBtnResetable {
        RClickStack := []
        RClickIndex := 1
        RBtnResetable := false
    }
    BlockInput On
    CoordMode, Mouse, Screen
    MouseGetPos, Mouse2_gotoX, Mouse2_gotoY
    RClickStack.Push([Mouse2_gotoX, Mouse2_gotoY])
    Sleep 75
    BlockInput Off
Return
#RButton::
    RBtnResetable := true
    BlockInput On
    CoordMode, Mouse, Screen
    MouseMove, RClickStack[RClickIndex][1], RClickStack[RClickIndex][2]
    RClickIndex := Mod(RClickIndex, RClickStack.Length()) + 1
    Sleep 75
    Click
    BlockInput Off
Return

; =======================
; =====  KEYBOARD  ======
; =======================
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
        ; VA_SetDefaultEndpoint("ASUS VP228", 0)
        ; VA_SetDefaultEndpoint("Speakers (8- Logitech G533 Gaming Headset)", 0)
        VA_SetDefaultEndpoint("Speakers (Logitech G533 Gaming Headset)", 0)
    }
Return

; Alternative left-hand Media shortcuts
#q::Media_Play_Pause
#z::Media_Next
#`::Media_Prev
#[::Volume_Up
#/::Volume_Down

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

#Include unicode.ahk
