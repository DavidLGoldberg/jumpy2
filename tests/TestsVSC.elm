module TestsVSC exposing (suite)

import Expect exposing (Expectation)
import StateMachineVSC exposing (Msg(..), resetKeys, update)
import Test exposing (..)


suite : Test
suite =
    let
        initial =
            { active = False
            , keysEntered = ""
            , lastJumped = ""
            , labels = []
            , status = ""
            }

        labels =
            [ "aa", "ab", "ac" ]
    in
    describe "Jumpy"
        [ describe "reset"
            [ test "resets keys (too many keys)" <|
                \_ ->
                    { initial | keysEntered = "hello" }
                        |> resetKeys
                        |> Expect.equal initial
            , test "resets keys (1 letter)" <|
                \_ ->
                    { initial | keysEntered = "h" }
                        |> resetKeys
                        |> Expect.equal initial
            , test "resets keys (empty key)" <|
                \_ ->
                    { initial | keysEntered = "" }
                        |> resetKeys
                        |> Expect.equal initial
            , test "reset does not set message if off" <|
                \_ ->
                    initial
                        |> update Reset
                        |> Tuple.first
                        |> Expect.equal initial
            ]
        , describe "adding a key"
            [ test "does not add any non matched keys" <|
                \_ ->
                    initial
                        -- add "Z"
                        |> update (LoadLabels labels)
                        |> Tuple.first
                        |> update (KeyEntered 90)
                        |> Tuple.first
                        |> Expect.equal
                            { initial
                                | labels = labels
                                , active = True
                                , status = "No Match! 😞"
                            }
            , test "adds a matched key" <|
                \_ ->
                    initial
                        -- add "a"
                        |> update (LoadLabels labels)
                        |> Tuple.first
                        |> update (KeyEntered 97)
                        |> Tuple.first
                        |> Expect.equal
                            { initial
                                | labels = labels
                                , active = True
                                , keysEntered = "a"
                                , status = "a"
                            }
            ]
        , describe "turning on/off"
            [ test "reports active True after load" <|
                \_ ->
                    initial
                        |> update (LoadLabels labels)
                        |> Tuple.first
                        |> Expect.equal
                            { initial
                                | labels = labels
                                , active = True
                                , keysEntered = ""
                                , status = "Jump Mode!"
                            }
            , test "reports active False after an exit" <|
                \_ ->
                    initial
                        |> update (LoadLabels labels)
                        |> Tuple.first
                        |> update Exit
                        |> Tuple.first
                        |> Expect.equal
                            { initial
                                | labels = labels
                                , active = False
                            }
            ]
        ]
