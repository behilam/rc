#NoEnv ; Recommended for performance and compatibility with future AutoHotkey releases.
#SingleInstance Force
; #Warn  ; Enable warnings to assist with detecting common errors.
SendMode Input ; Recommended for new scripts due to its superior speed and reliability.
SetWorkingDir %A_ScriptDir% ; Ensures a consistent starting directory.

; ---------- First Line ----------
>+1::
  char := Chr(161) ; ¡
  Send, %char%
Return
<>+1::
  char := Chr(188) ; ¼
  Send, %char%
Return

>+2::
  char := Chr(169) ; ©
  Send, %char%
Return

>+3::
  char := Chr(163) ; £
  Send, %char%
Return
<>+3::
  char := Chr(190) ; ¾
  Send, %char%
Return

>+4::
  char := Chr(8364) ; €
  Send, %char%
Return
<>+4::
  char := Chr(162) ; ¢
  Send, %char%
Return

<>+5::
  char := Chr(189) ; ½
  Send, %char%
Return

>+6::
  char := Chr(181) ; µ
  Send, %char%
Return

>+7::
  char := Chr(176) ; ° 
  Send, %char%
Return

>+8::
  char := Chr(215) ; ×
  Send, %char%
Return
<>+8::
  char := Chr(183) ; ·
  Send, %char%
Return

>+9::
  char := Chr(186) ; º
  Send, %char%
Return
<>+9::
  char := Chr(170) ; ª
  Send, %char%
Return

>+0::
  char := Chr(248) ; ø
  Send, %char%
Return
<>+0::
  char := Chr(216) ; Ø
  Send, %char%
Return

>+-::
  char := Chr(8211) ; – (En dash)
  Send, %char%
Return
<>+-::
  char := Chr(8212) ; — (Em dash)
  Send, %char%
Return

>+=::
  char := Chr(177) ; ±
  Send, %char%
Return
<>+=::
  char := Chr(8734) ; ∞
  Send, %char%
Return

; ----------Second line ------------
>+w::
  char := Chr(365) ; ŭ
  Send, %char%
Return
<>+w::
  char := Chr(364) ; Ŭ
  Send, %char%
Return

>+e::
  char := Chr(233) ; é
  Send, %char%
Return
<>+e::
  char := Chr(201) ; É
  Send, %char%
Return

>+y::
  char := Chr(252) ; ü
  Send, %char%
Return

<>+y::
  char := Chr(165) ; ¥
  Send, %char%
Return

>+u::
  char := Chr(250) ; ú
  Send, %char%
Return
<>+u::
  char := Chr(218) ; Ú
  Send, %char%
Return

>+i::
  char := Chr(237) ; í
  Send, %char%
Return
<>+i::
  char := Chr(205) ; Í
  Send, %char%
Return

>+o::
  char := Chr(243) ; ó
  Send, %char%
Return
<>+o::
  char := Chr(211) ; Ó
  Send, %char%
Return

; ------------ Third Line -------------
>+a::
  char := Chr(225) ; á
  Send, %char%
Return
<>+a::
  char := Chr(193) ; Á
  Send, %char%
Return

>+s::
  char := Chr(349) ; ŝ
  Send, %char%
Return
<>+s::
  char := Chr(348) ; Ŝ
  Send, %char%
Return

>+g::
  char := Chr(285) ; ĝ
  Send, %char%
Return
<>+g::
  char := Chr(284) ; Ĝ
  Send, %char%
Return

>+h::
  char := Chr(293) ; ĥ
  Send, %char%
Return
<>+h::
  char := Chr(292) ; Ĥ
  Send, %char%
Return

>+j::
  char := Chr(309) ; ĵ
  Send, %char%
Return
<>+j::
  char := Chr(308) ; Ĵ
  Send, %char%
Return

>+;::
char := Chr(241) ; ñ
Send, %char%
Return
<>+;::
char := Chr(209) ; Ñ
Send, %char%
Return

<>+'::
  char := Chr(8230) ; …
  Send, %char%
Return

<>+\::
  char := Chr(172) ; ¬
  Send, %char%
Return

; --------------- Fourth Line --------------
>+c::
  char := Chr(265) ; ĉ
  Send, %char%
Return
<>+c::
  char := Chr(264) ; Ĉ
  Send, %char%
Return

<>+b::
  char := Chr(223) ; ß
  Send, %char%
Return

>+,::
  char := Chr(8249) ; ‹
  Send, %char%
Return
<>+,::
  char := Chr(171) ; «
  Send, %char%
Return

>+.::
  char := Chr(8250) ; ›
  Send, %char%
Return
<>+.::
  char := Chr(187) ; »
  Send, %char%
Return

>+/::
  char := Chr(247) ; ÷
  Send, %char%
Return
<>+/::
  char := Chr(191) ; ¿
  Send, %char%
Return
