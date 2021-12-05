#NoEnv  ; Recommended for performance and compatibility with future AutoHotkey releases.
; #Warn  ; Enable warnings to assist with detecting common errors.
SendMode Input  ; Recommended for new scripts due to its superior speed and reliability.
SetWorkingDir %A_ScriptDir%  ; Ensures a consistent starting directory.
#SingleInstance, force
#UseHook, On

; Mouse
XButton1::Browser_Back
XButton1 & LButton::Media_Next
XButton1 & RButton::Media_Prev
XButton1 & WheelDown::Volume_Down
XButton1 & WheelUp::Volume_Up
XButton1 & MButton::Media_Play_Pause