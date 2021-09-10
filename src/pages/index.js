import React, { useRef } from "react";
import CircularLoad from './circularProgress';
import DeleteIcon from '@material-ui/icons/Delete';
import {
  Container,
  Flex,
  Button,
  Input,
  Label,
  Checkbox
} from "theme-ui";
import { gql, useMutation, useQuery } from "@apollo/client";

const ADD_TODO = gql`
  mutation AddTodo($text: String!) {
    addTodo(text: $text) {
      id
    }
  }
`;

const UPDATE_TODO_DONE = gql`
  mutation UpdateTodoDone($text: String!, $done: Boolean!) {
    updateTodoDone(text: $text, done: $done) {
      id
      text
      done
    }
  }
`;

const DELETE_TODO = gql`
  mutation DeleteTodo($text: String!){
    deleteTodo(text:$text){
      done
      text
      id
    }
  }
`;

const GET_TODOS = gql`
  query GetTodos {
    todos {
      id
      text
      done
    }
  }
`;

export default () => {
  const inputRef = useRef();
  const [addTodo, addTodoObj] = useMutation(ADD_TODO);
  const [updateTodoDone, updateTodoObj] = useMutation(UPDATE_TODO_DONE);
  const [deleteTodo, deleteTodoObj] = useMutation(DELETE_TODO);
  const { loading, error, data, refetch } = useQuery(GET_TODOS);
  return (
    <Container>
      <Flex
        as="form"
        onSubmit={async e => {
          e.preventDefault();
          await addTodo({ variables: { text: inputRef.current.value } });
          inputRef.current.value = "";
          await refetch();
        }}
      >
        <Label sx={{ display: "flex" }}>
          <span>Create&nbsp;Operation!</span>
          <Input ref={inputRef} sx={{ marginLeft: 1 }} />
        </Label>
        <Button sx={{ marginLeft: 1, color: 'darkolivegreen' }}>GO!</Button>
      </Flex>
      <Flex sx={{ flexDirection: "column" }}>
        {loading ? <div><h3>Loading...</h3><CircularLoad /></div> : null}
        {error ? <div>{error.message}</div> : null}
        {(updateTodoObj.loading || addTodoObj.loading || deleteTodoObj.loading) ? <CircularLoad /> : null}
        {!loading && !error && (
          <ul sx={{ listStyleType: "none" }}>
            {data.todos.map(todo => {
              if (!todo.done) {
                return (
                  <Flex
                    key={todo.id}
                    as="li"
                  >
                    <Flex
                      onClick={async () => {
                        await updateTodoDone({ variables: { text: todo.text, done: !todo.done } });
                        await refetch();
                      }}
                      as="div"
                    >
                      <Checkbox
                        checked={todo.done} readOnly
                      />
                    </Flex>
                    <span>{todo.text}</span>
                    <div onClick={async () => {
                      await deleteTodo({ variables: { text: todo.text } })
                      await refetch()
                    }}>
                      <DeleteIcon />
                    </div>
                  </Flex>
                )
              }
              else {
                return (
                  <Flex
                    key={todo.id}
                    as="li"
                  >
                    <Flex
                      onClick={async () => {
                        await updateTodoDone({ variables: { text: todo.text, done: !todo.done } });
                        await refetch();
                      }}
                      as="div"
                    >
                      <Checkbox
                        checked={todo.done} readOnly
                      />
                    </Flex>
                    <span><s>{todo.text}</s></span>
                    <div onClick={async () => {
                      await deleteTodo({ variables: { text: todo.text } })
                      await refetch()
                    }}>
                      <DeleteIcon />
                    </div>
                  </Flex>
                )
              }
            })}
          </ul>
        )}
        {((data === undefined)||((!loading && !error)&&(data.todos.length===0))) ?
          <div>
            <p>ADD A TODO TO EXPERIENCE THE 'C' (CREATE) OF CRUD<br /> THEN YOU CAN CHECK THE BOX APPEARING INFRONT OF YOU FOR <br />'U' OF CRUD, OR YOU CAN CLICK THE DELETE ICON FOR 'D'.<br /> AS FOR THE 'R' (RETRIEVE), YOU CAN SEE THAT THE TODOS YOU ADD<br />ARE DISPLAYED IN FRONT OF YOU. THAT'S BECAUSE THEY HAVE BEEN RETRIEVED!</p>
          </div>
          : null}
      </Flex>
    </Container>
  );
};