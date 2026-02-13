module VSCStatusFunctions exposing (addKeyToStatus, clearStatus, resetStatus, setNoMatchStatus)


clearStatus : String
clearStatus =
    ""


resetStatus : String
resetStatus =
    "Jump!"


setNoMatchStatus : String
setNoMatchStatus =
    "No Match! 😞"


addKeyToStatus : String -> String
addKeyToStatus keyEntered =
    keyEntered
