interface IRegister {
  fullname: string;
  email: string;
  password: string;
  role: string;
}

interface ILogin {
  email: string;
  password: string;
}

interface IVerification {
  email: string;
}

interface INewPassword {
  token?: string;
  old_password: string;
  new_password: string;
}

interface IActivation {
  token: string;
}

export type { IRegister, ILogin, IVerification, INewPassword, IActivation };
