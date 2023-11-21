import type { PropsWithChildren } from 'react';

export interface IPageProps extends PropsWithChildren {
  navigation: {
    navigate: any;
    push: any;
    popToTop: any;
    goBack: any;
  };
}
