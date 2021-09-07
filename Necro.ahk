#NoEnv  ; Recommended for performance and compatibility with future AutoHotkey releases.
; #Warn  ; Enable warnings to assist with detecting common errors.
SendMode Input  ; Recommended for new scripts due to its superior speed and reliability.
SetWorkingDir %A_ScriptDir%  ; Ensures a consistent starting directory.

#IfWinActive, Crypt of the NecroDancer
; ===================== Only Diamond ========================
    ; Item
    [::
    Send, {Left} {Right}
    Return

    ; Bomb
    m::
    Send, {Up} {Down}
    Return

    ; UpLeft
    i::
    Send, {Up} {Left}
    Return

    ; UpRight
    p::
    Send, {Up} {Right}
    Return

    ; DownLeft
    j::
    Send, {Down} {Left}
    Return

    ; DownRight
    '::
    Send, {Down} {Right}
    Return

; ===================== Diamond 2 ==========================
    ; Item
    w::
    Send, ad
    Return

    ; Bomb
    b::
    Send, ws
    Return

    ; UpLeft
    e::
    Send, wa
    Return

    ; UpRight
    t::
    Send, wd
    Return

    ; DownLeft
    s::
    Send, as
    Return

    ; DownRight
    h::
    Send, sd
    Return
;====================== Two players =========================
    l::
    Send, {Down}
    Return

    o::
    Send, {Up}
    Return

    `;::
    Send, {Right}
    Return

    k::
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
    f::s
    r::w
    g::d
    d::a
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
