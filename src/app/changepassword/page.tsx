import {ChangePassword} from '@/app/changepassword/components/ChangePassword';

export default function ChangePasswordPage() {
  return (
    <div className='flex flex-col justify-center h-screen gap-4 px-4'>
      <h1 className='text-2xl font-bold'>Şifre Değişikliği</h1>

      <ChangePassword />
    </div>
  );
}
