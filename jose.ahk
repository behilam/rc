#NoEnv  ; Recommended for performance and compatibility with future AutoHotkey releases.
; #Warn  ; Enable warnings to assist with detecting common errors.
SendMode Input  ; Recommended for new scripts due to its superior speed and reliability.
SetWorkingDir %A_ScriptDir%  ; Ensures a consistent starting directory.
#SingleInstance, force
#UseHook, On

<^Tab::AltTab

^F1::Send, {CtrlDown}1
^F2::Send, {CtrlDown}2
^F3::Send, {CtrlDown}3
^F4::Send, {CtrlDown}4
^F5::Send, {CtrlDown}5
^F6::Send, {CtrlDown}6
^F7::Send, {CtrlDown}7
^F8::Send, {CtrlDown}8
^F9::Send, {CtrlDown}9
^F10::Send, {CtrlDown}10

F1::
If GetKeyState("CapsLock", "T")
{
  Send, {F1}
} else {
  Send, 1
}
Return

F2::
If GetKeyState("CapsLock", "T")
{
  Send, {F2}
} else {
  Send, 2
}
Return

F3::
If GetKeyState("CapsLock", "T")
{
  Send, {F3}
} else {
  Send, 3
}
Return



F4::
If GetKeyState("CapsLock", "T")
{
  Send, {F4}
} else {
  Send, 4
}
Return



F5::
If GetKeyState("CapsLock", "T")
{
  Send, {F5}
} else {
  Send, 5
}
Return



F6::
If GetKeyState("CapsLock", "T")
{
  Send, {F6}
} else {
  Send, 6
}
Return



F7::
If GetKeyState("CapsLock", "T")
{
  Send, {F7}
} else {
  Send, 7
}
Return



F8::
If GetKeyState("CapsLock", "T")
{
  Send, {F8}
} else {
  Send, 8
}
Return

F9::
If GetKeyState("CapsLock", "T")
{
  Send, {F9}
} else {
  Send, 9
}
Return

F10::
If GetKeyState("Ctrl")
{
  Send, x
}
Else If GetKeyState("CapsLock", "T")
{
  Send, {F10}
} else {
  Send, 0
}
Return

; 5 and 6 to Volume control
5::Volume_Down
6::Volume_UP


; Media control
Home::
If GetKeyState("CapsLock", "T")
{
  Send, {Home}
} else {
  Send, {Media_Play_Pause}
}
Return
;;;;;;;
PgUp::
If GetKeyState("CapsLock", "T")
{
  Send, {PgUp}
} else {
  Send, {Media_Next}
}
Return
;;;;;;;
PgDn::
If GetKeyState("CapsLock", "T")
{
  Send, {PgDn}
} else {
  Send, {Media_Prev}
}
Return
;;;;;;;
End::
If GetKeyState("CapsLock", "T")
{
  Send, {End}
} else {
  Send, {Volume_Mute}
}
Return












