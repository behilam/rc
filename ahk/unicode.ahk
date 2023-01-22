; ---------- First Line ----------
>+1::Send, % (Chr(161)) ; ¡
<>+1::Send, % (Chr(188)) ; ¼

>+2::Send, % (Chr(169)) ; ©

>+3::Send, % (Chr(163)) ; £
<>+3::Send, % (Chr(190)) ; ¾

>+4::Send, % (Chr(8364)) ; €
<>+4::Send, % (Chr(162)) ; ¢

<>+5::Send, % (Chr(189)) ; ½

>+6::Send, % (Chr(181)) ; µ

>+7::Send, % (Chr(176)) ; °

>+8::Send, % (Chr(215)) ; ×
<>+8::Send, % (Chr(183)) ; ·

>+9::Send, % (Chr(186)) ; º
<>+9::Send, % (Chr(170)) ; ª

>+0::Send, % (Chr(248)) ; ø
<>+0::Send, % (Chr(216)) ; Ø

>+-::Send, % (Chr(8211)) ; – (En dash)
<>+-::Send, % (Chr(8212)) ; — (Em dash)

>+=::Send, % (Chr(177)) ; ±
<>+=::Send, % (Chr(8734)) ; ∞

; ----------Second line ------------
; Ithkuil
>!t::Send, % (Chr(355)) ; ţt͕
>!s::Send, % (Chr(353)) ; š
>!z::Send, % (Chr(382)) ;
>!c::Send, % (Chr(269)) ; č
>!n::Send, % (Chr(328)) ; ň
>!r::Send, % (Chr(345)) ; ř
>!l::
  char := Chr(108) ; l͕
  ext := Chr(853)
  Send, %char%%ext%
Return
  >!;::Send, % (Chr(853)) ;
>!p::
  ext := Chr(807) ;
  ; ext := Chr(711) ;
  Send, %ext%
Return
>!'::Send, % (Chr(8217)) ; ’

>+w::Send, % (Chr(365)) ; ŭ
<>+w::Send, % (Chr(364)) ; Ŭ

>+e::Send, % (Chr(233)) ; é
<>+e::Send, % (Chr(201)) ; É

>+y::Send, % (Chr(252)) ; ü

<>+y::Send, % (Chr(165)) ; ¥

>+u::Send, % (Chr(250)) ; ú
<>+u::Send, % (Chr(218)) ; Ú

>+i::Send, % (Chr(237)) ; í
<>+i::Send, % (Chr(205)) ; Í

>+o::Send, % (Chr(243)) ; ó
<>+o::Send, % (Chr(211)) ; Ó

; ------------ Third Line -------------
>+a::Send, % (Chr(225)) ; á
<>+a::Send, % (Chr(193)) ; Á

>+s::Send, % (Chr(349)) ; ŝ
<>+s::Send, % (Chr(348)) ; Ŝ

>+g::Send, % (Chr(285)) ; ĝ
<>+g::Send, % (Chr(284)) ; Ĝ

>+h::Send, % (Chr(293)) ; ĥ
<>+h::Send, % (Chr(292)) ; Ĥ

>+j::Send, % (Chr(309)) ; ĵ
<>+j::Send, % (Chr(308)) ; Ĵ

  >+;::Send, % (Chr(241)) ; ñ
  <>+;::Send, % (Chr(209)) ; Ñ

<>+'::Send, % (Chr(8230)) ; …

<>+\::Send, % (Chr(172)) ; ¬

; --------------- Fourth Line --------------
>+c::Send, % (Chr(265)) ; ĉ
<>+c::Send, % (Chr(264)) ; Ĉ

>+b::Send, % (Chr(223)) ; ß

>+,::Send, % (Chr(8249)) ; ‹
<>+,::Send, % (Chr(171)) ; «

>+.::Send, % (Chr(8250)) ; ›
<>+.::Send, % (Chr(187)) ; »

>+/::Send, % (Chr(247)) ; ÷
<>+/::Send, % (Chr(191)) ; ¿
