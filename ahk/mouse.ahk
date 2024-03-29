; * Mouse 6
F18 & LButton::Media_Next
F18 & RButton::Media_Prev
F18 & MButton::Media_Play_Pause
F18 & WheelDown::Volume_Down
F18 & WheelUp::Volume_Up
; XButton1 & F18::
; ^F18::
; !F18::
; ^!F18::
F18::
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
^F18::^-

; * Mouse 3
; F15 & LButton::
; F15 & RButton::
F15 & MButton::Send, ^{F4}
F15 & WheelDown::Send, ^{Tab}
F15 & WheelUp::Send, ^+{Tab}
; F15 & F18::
; ^F15::
; !F15::
; ^!F15::
F15::
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
^F15::^+

; * Mouse 4
F16 & LButton::^x
F16 & RButton::Delete
F16 & WheelDown::Right
F16 & WheelUp::Left
; F16 & MButton::
; F16 & F18::
; ^F16::
; !F16::
; ^!F16::
; F16::
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
F17 & LButton::^c
F17 & RButton::^v
F17 & WheelDown::Down
F17 & WheelUp::Up
; F17 & MButton::
; F17 & F18::
; ^F17::
; !F17::
; ^!F17::
; F17::
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
F20 & LButton::^z
F20 & RButton::^+z
; F20 & WheelDown::
; F20 & WheelUp::
; F20 & MButton::
; F20 & F18::
; ^F20::
; !F20::
; ^!F20::
F20::
  ; LButton & Mouse_8
  if (GetKeyState("LButton", "P")) {
    Send, {Esc}
    Return
  }

  ; F18 & Mouse_8
  ; if (GetKeyState("F18", "P")) {
  ;     Return
  ; }

  Send, F20
Return

; * Mouse 9
F21 & LButton::^a
; F21 & RButton::
; F21 & WheelDown::
; F21 & WheelUp::
; F21 & MButton::
; F21 & F18::
; ^F21::
; !F21::
; ^!F21::
F21::
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
