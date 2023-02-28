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
>+t::Send, % (Chr(807)) ; ̧t (combining cedilla)
>+s::Send, % (Chr(780)) ; ̌s (combining caron)
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

>+w::Send, % (Chr(774)) ; ŭ (combining breve)
>+e::Send, % (Chr(769)) ; é (combining acute)

>+u::Send, % (Chr(776)) ; ̈u (combining diaeresis)

<>+y::Send, % (Chr(165)) ; ¥

; ------------ Third Line -------------
>+g::Send, % (Chr(770)) ; ĝ (combining circumflex)

>+;::Send, % (Chr(771)) ; ̃n (combining tilde)

<>+'::Send, % (Chr(8230)) ; …

<>+\::Send, % (Chr(172)) ; ¬

; --------------- Fourth Line --------------
>+b::Send, % (Chr(223)) ; ß

>+,::Send, % (Chr(8249)) ; ‹
<>+,::Send, % (Chr(171)) ; «

>+.::Send, % (Chr(8250)) ; ›
<>+.::Send, % (Chr(187)) ; »

>+/::Send, % (Chr(247)) ; ÷
<>+/::Send, % (Chr(191)) ; ¿
