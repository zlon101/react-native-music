import React, { createContext, useContext, useReducer } from 'react';
import type { PropsWithChildren } from 'react';

const LogContext = createContext<{
  logState: any[];
  dispatch: (...args: any[]) => void;
}>(null as any);

interface IAction {
  type: string;
  label: string;
  [k: string]: any;
}

function logReducer(tasks: any[], action: IAction) {
  if (!action.id) {
    action.id = Math.random();
  }
  switch (action.type) {
    case 'add': {
      return [...tasks, action];
    }
    case 'changed': {
      return tasks.map(t => {
        if (t.id === action.task.id) {
          return action.task;
        } else {
          return t;
        }
      });
    }
    default: {
      throw Error('Unknown action: ' + action.type);
    }
  }
}

export function LogProvider(props: PropsWithChildren) {
  const { children } = props;
  const [logState, dispatch] = useReducer(logReducer, []);

  return <LogContext.Provider value={{ logState, dispatch }}>{children}</LogContext.Provider>;
}

export function useLog() {
  return useContext(LogContext);
}
