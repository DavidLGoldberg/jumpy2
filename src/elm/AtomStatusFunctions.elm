module AtomStatusFunctions exposing (addKeyToStatus, clearStatus, resetStatus, setNoMatchStatus)


clearStatus : String
clearStatus =
    ""


resetStatus : String
resetStatus =
    "<div id='status-bar-jumpy'>Jumpy: <span class='status'>Jump Mode!</span></div>"


setNoMatchStatus : String
setNoMatchStatus =
    "<div id='status-bar-jumpy' class='no-match'>Jumpy: <span>No Match! 😞</span></div>"


addKeyToStatus : String -> String
addKeyToStatus keyEntered =
    "<div id='status-bar-jumpy'>Jumpy: <span class='status'>" ++ keyEntered ++ "</span></div>"
