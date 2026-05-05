import {ChangePassword} from '@/app/changepassword/components/ChangePassword';

export default function ChangePasswordPage() {
  return (
    <div className='flex flex-col pt-24 h-screen gap-4 px-4 bg-secondary'>
      <h1 className='text-2xl font-bold'>Passwortänderung</h1>

      <ChangePassword />
    </div>
  );
}
