export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string };
};

export type MainTabParamList = {
  Home: undefined;
  Dances: undefined;
  Activities: undefined;
  Profile: undefined;
};

export type MainStackParamList = {
  Tabs: undefined;
  About: undefined;
  Credits: undefined;
  BuyCredits: undefined;
  QRScanner: undefined;
  AdminSession: undefined;
  AdminAttendance: { sessionId: string };
  Ella: undefined;
  EllaKnutselen: undefined;
  EllaRekenen: undefined;
  EllaMaaltafelPuzzel: undefined;
  EllaVaria: undefined;
  EllaDinoQuiz: undefined;
  EllaPlanetPuzzel: undefined;
  EllaRekenoefeningen: undefined;
  EllaResultaten: undefined;
  Prono: undefined;
  PronoCompetition: { competitionId: string };
  QuizJoin: undefined;
  QuizPlay: { sessionId: string; participantId: string };
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};
