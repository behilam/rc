; * Mouse 6
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
^XButton1::^-

; * Mouse 3
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
^XButton2::^+

; * Mouse 4
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

; * Mouse 5
F14 & LButton::^c
F14 & RButton::^v
F14 & WheelDown::Down
F14 & WheelUp::Up
; F14 & MButton::
; F14 & F18::
; ^F14::
; !F14::
; ^!F14::
; F14::
; LButton & Mouse_4
; if (GetKeyState("LButton", "P")) {
;     Return
; }

; F18 & Mouse_4
; if (GetKeyState("F18", "P")) {
;     Return
; }

; Send, {Browser_Back}
; Return

; * Mouse 8
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

; * Mouse 9
F17 & LButton::^a
; F17 & RButton::
; F17 & WheelDown::
; F17 & WheelUp::
; F17 & MButton::
; F17 & F18::
; ^F17::
; !F17::
; ^!F17::
F17::
  ; LButton & Mouse_9
  ; if (GetKeyState("LButton", "P")) {
  ;     Return
  ; }

  ; F18 & Mouse_9
  ; if (GetKeyState("F18", "P")) {
  ;     Return
  ; }

  ShowTooltip("F19 pressed")
Return

; * Mouse save location and quick go to location
!#LButton::
  if LBtnResetable {
    LClickStack := []
    LClickIndex := 1
    LBtnResetable := false
  }
  CoordMode, Mouse, Screen
  MouseGetPos, Mouse2_gotoX, Mouse2_gotoY
  LClickStack.Push([Mouse2_gotoX, Mouse2_gotoY])
  Send, {LButton}
Return
#LButton::
  LBtnResetable := true
  CoordMode, Mouse, Screen
  MouseMove, LClickStack[LClickIndex][1], LClickStack[LClickIndex][2]
  LClickIndex := Mod(LClickIndex, LClickStack.Length()) + 1
  Sleep 10
  Send, {LButton}
Return
; V ;
!#RButton::
  if RBtnResetable {
    RClickStack := []
    RClickIndex := 1
    RBtnResetable := false
  }
  BlockInput On
  CoordMode, Mouse, Screen
  MouseGetPos, Mouse2_gotoX, Mouse2_gotoY
  RClickStack.Push([Mouse2_gotoX, Mouse2_gotoY])
  Send, {LButton}
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
  Send, {Lbutton}
  BlockInput Off
Return
