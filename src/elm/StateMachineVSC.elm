port module StateMachineVSC exposing (Flags, Labels, Model, Msg(..), activeChanged, exit, getLabels, init, key, labelJumped, main, modelAndJumped, modelAndStatus, reset, resetKeys, statusChanged, turnOff, turnOn, update, validKeyEntered)

import Char
import List
import String exposing (length, startsWith)
import VSCStatusFunctions exposing (addKeyToStatus, clearStatus, resetStatus, setNoMatchStatus)


main : Program Flags Model Msg
main =
    Platform.worker
        { init = init
        , update = update
        , subscriptions =
            \_ ->
                Sub.batch
                    [ getLabels LoadLabels
                    , key KeyEntered
                    , reset (Basics.always Reset)
                    , exit (Basics.always Exit)
                    ]
        }


type alias Labels =
    List String



-- Outbound


port activeChanged : Bool -> Cmd msg


port statusChanged : String -> Cmd msg


port validKeyEntered : String -> Cmd msg


port labelJumped : String -> Cmd msg



-- Inbound


port getLabels : (Labels -> msg) -> Sub msg


port key : (Int -> msg) -> Sub msg


port reset : (() -> msg) -> Sub msg


port exit : (() -> msg) -> Sub msg


type Msg
    = LoadLabels Labels
    | Reset
    | KeyEntered Int
    | Exit


type alias Model =
    { active : Bool
    , keysEntered : String
    , lastJumped : String
    , labels : Labels
    , status : String
    }


type alias Flags =
    {}


init : Flags -> ( Model, Cmd Msg )
init _ =
    ( { active = False
      , keysEntered = ""
      , lastJumped = ""
      , labels = []
      , status = ""
      }
    , Cmd.none
    )


resetKeys : Model -> Model
resetKeys model =
    { model | keysEntered = "" }


turnOff : Model -> Model
turnOff model =
    { model | active = False }
        |> resetKeys
        |> (\m -> { m | status = clearStatus })


modelAndStatus : Model -> ( Model, Cmd Msg )
modelAndStatus model =
    ( model
    , Cmd.batch
        [ activeChanged model.active
        , statusChanged model.status
        , validKeyEntered model.keysEntered
        ]
    )


modelAndJumped : Model -> ( Model, Cmd Msg )
modelAndJumped model =
    ( model
    , Cmd.batch
        [ activeChanged model.active
        , statusChanged model.status
        , labelJumped model.lastJumped
        ]
    )


turnOn : Model -> Model
turnOn model =
    { model | active = True }
        |> (\m -> { m | status = resetStatus })


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        KeyEntered keyCode ->
            let
                keyEntered =
                    keyCode |> Char.fromCode |> String.fromChar

                newKeysEntered =
                    model.keysEntered ++ keyEntered

                keysEnteredMatch =
                    model.labels
                        |> List.any (\label -> startsWith newKeysEntered label)
            in
            if model.active then
                if not keysEnteredMatch then
                    model
                        |> (\m -> { m | status = setNoMatchStatus })
                        |> modelAndStatus

                else
                    case length model.keysEntered of
                        0 ->
                            -- FIRST LETTER ----------
                            { model | keysEntered = newKeysEntered }
                                |> (\m -> { m | status = addKeyToStatus keyEntered })
                                |> modelAndStatus

                        1 ->
                            -- SECOND LETTER ----------
                            { model | lastJumped = newKeysEntered }
                                |> turnOff
                                |> modelAndJumped

                        _ ->
                            ( model, Cmd.none )

            else
                ( model, Cmd.none )

        Reset ->
            if model.active then
                model
                    |> resetKeys
                    |> (\m -> { m | status = resetStatus })
                    |> modelAndStatus

            else
                ( model, Cmd.none )

        LoadLabels labels ->
            { model | labels = labels }
                |> turnOn
                |> modelAndStatus

        Exit ->
            model
                |> turnOff
                |> modelAndStatus
