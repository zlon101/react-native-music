import React, {FunctionComponent} from 'react';
import {SvgProps} from 'react-native-svg';
import AscIcon from './正序.svg';
import DesIcon from './倒序.svg';
import RandomIcon from './随机.svg';
import CycleIcon from './单曲循环.svg';
import {useMemo} from 'react';

const OrderList = ['正序', '倒序', '随机', '单曲循环'] as const;
const N = OrderList.length;

const OrderIconMap = {
  '正序': AscIcon,
  '倒序': DesIcon,
  '随机': RandomIcon,
  '单曲循环': CycleIcon,
} as const;

export type IPlayOrder = (typeof OrderList)[number];

export function useOrder(orderType: IPlayOrder): [FunctionComponent<SvgProps>, IPlayOrder] {
  const icon = useMemo(() => OrderIconMap[orderType], [orderType]);
  const nowIdx = OrderList.indexOf(orderType);
  const nextType = OrderList[nowIdx >= N - 1 ? 0 : nowIdx + 1];
  return [icon, nextType];
}