﻿#NoEnv  ; Recommended for performance and compatibility with future AutoHotkey releases.
; #Warn  ; Enable warnings to assist with detecting common errors.
SendMode Input  ; Recommended for new scripts due to its superior speed and reliability.
SetWorkingDir %A_ScriptDir%  ; Ensures a consistent starting directory.
#SingleInstance, force
#UseHook, On

; Mouse
XButton1::Browser_Back
XButton1 & WheelDown::Volume_Down
XButton1 & WheelUp::Volume_Up

XButton2::Browser_Forward
XButton2 & WheelDown::Send, ^{Tab}
XButton2 & WheelUp::Send, ^+{Tab}
