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
>!'::Send, % (Chr(8217)) ; ’ (quotation mark)

>+w::Send, % (Chr(774)) ; ŭ (combining breve)
>+e::Send, % (Chr(769)) ; é (combining acute)
>+u::Send, % (Chr(776)) ; ̈u (combining diaeresis)
>+o::Send, % (Chr(772)) ; ō (combining macron)

<>+y::Send, % (Chr(165)) ; ¥

; ------------ Third Line -------------
>+a::Send, % (Chr(768)) ; à (combining grave accent)
>+g::Send, % (Chr(770)) ; ĝ (combining circumflex)
>+;::Send, % (Chr(771)) ; ̃n (combining tilde)

<>+'::Send, % (Chr(8230)) ; …

<>+\::Send, % (Chr(172)) ; ¬

; --------------- Fourth Line --------------
>+z::Send, % (Chr(803)) ; ẓ (combining dot below)

>+b::Send, % (Chr(223)) ; ß

>+,::Send, % (Chr(8249)) ; ‹
<>+,::Send, % (Chr(171)) ; «

>+.::Send, % (Chr(8250)) ; ›
<>+.::Send, % (Chr(187)) ; »

>+/::Send, % (Chr(247)) ; ÷
<>+/::Send, % (Chr(191)) ; ¿
