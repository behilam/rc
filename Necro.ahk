#NoEnv  ; Recommended for performance and compatibility with future AutoHotkey releases.
; #Warn  ; Enable warnings to assist with detecting common errors.
SendMode Input  ; Recommended for new scripts due to its superior speed and reliability.
SetWorkingDir %A_ScriptDir%  ; Ensures a consistent starting directory.

#IfWinActive, Crypt of the NecroDancer
; ===================== Only Diamond ========================
     ; Item
     p::
     Send, {Left} {Right}
     Return

     ; Bomb
     n::
     Send, {Up} {Down}
     Return

     ; UpLeft
     u::
     Send, {Up} {Left}
     Return

     ; UpRight
     o::
     Send, {Up} {Right}
     Return

     ; DownLeft
     h::
     Send, {Down} {Left}
     Return

     ; DownRight
     `;::
     Send, {Down} {Right}
     Return

; ===================== Diamond 2 ==========================
     ; Item
     q::
     Send, ad
     Return

     ; Bomb
     v::
     Send, ws
     Return

     ; UpLeft
     w::
     Send, wa
     Return

     ; UpRight
     r::
     Send, wd
     Return

     ; DownLeft
     a::
     Send, as
     Return

     ; DownRight
     g::
     Send, sd
     Return
;====================== Two players =========================
    k::
    Send, {Down}
    Return

    i::
    Send, {Up}
    Return

    l::
    Send, {Right}
    Return

    j::
    Send, {Left}
    Return

;     ; Food
;     p::
;     Send, {Up} {Left}
;     Return

;     ; Power 1
;     u::
;     Send, {Up} {Right}
;     Return

;     ; Power 2
;     h::
;     Send, {Down} {Right}
;     Return

;     ; Change/throw weapon
;     `;::
;     Send, {Up} {Down}
;     Return

;     ; Item 2
;     o::
;     Send, {Left} {Right}
;     Return

;     ; Bomb
;     n::
;     Send, {Left} {Down}
;     Return


    ; LEFT HAND
    d::s
    e::w
    f::d
    s::a
;
;    ; Item 1
;    r::
;    Send, wa
;    Return
;
;    ; Power 1
;    w::
;    Send, wd
;    Return
;
;    ; Power 2
;    q::
;    Send, sd
;    Return
;
;    ; Bomb
;    a::
;    Send, as
;    Return
;
;    ; Item 2
;    g::
;    Send, ad
;    Return
;
;    ; Change/throw weapon
;    v::
;    Send, ws
;    Return
#IfWinActive
