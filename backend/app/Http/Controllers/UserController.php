<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rules\Password;
use Illuminate\Support\Str;

class UserController extends Controller
{
    function signin(Request $request){
        $request->validate([
            'username' => ['required', 'max:25', 'min:1', 'string'],
            'email' =>['required', 'email', 'unique:users'],
            'password' => ['required', 'confirmed', password::defaults()]
        ]);
        $user = User::create([
            'username' => $request->username,
            'email' =>  $request->email,
            'password' => Hash::make($request->password),
            'is_verified' => false,
        ]);

        $otp = Str::random(6);

        $user->otp = $otp;
        $user->otp_expires_at = now()->addMinutes(5);
        $user->save();

        Mail::send('emails.otp', ['otp' => $otp], function ($message) use ($user) {
            $message->to($user->email)
                ->subject('Your OTP for StoreIt Account Verification');
        });


        return response()->json([
            'message' => 'Account created successfully. Please verify your OTP sent to your email.',
        ], 201);
    }



    public function verifyOtp(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email'],
            'otp' => ['required', 'string', 'size:6'],
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['error' => 'User not found.'], 404);
        }

        if ($user->otp !== $request->otp || $user->otp_expires_at < now()) {
            return response()->json(['error' => 'Invalid or expired OTP.'], 400);
        }

        $user->is_verified = true;
        $user->otp = null;
        $user->otp_expires_at = null;
        $user->save();

        $token = $user->createToken('authToken')->plainTextToken;
        $user->token = $token;
        return response()->json([
            'message' => 'OTP verified successfully. Account activated.',
            'user' => $user,
            'token' => $token,
        ], 200);
    }

    public function resendOtp(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email'],
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['error' => 'User not found.'], 404);
        }

        if ($user->is_verified) {
            return response()->json(['error' => 'User is already verified.'], 400);
        }

        $otp = Str::random(6);
        $user->otp = $otp;
        $user->otp_expires_at = now()->addMinutes(5);
        $user->save();

        Mail::send('emails.otp', ['otp' => $otp], function ($message) use ($user) {
            $message->to($user->email)
                ->subject('Your OTP for Account Verification (Resent)');
        });

        return response()->json([
            'message' => 'A new OTP has been sent to your email.',
        ], 200);
    }


    function login(Request $request){
        $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', Password::defaults()]
        ]);
        $user = User::where('email', $request->email)->first();
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'error' => 'Invalid credentials, please try again.',
            ], 401);
        }
        $token = $user->createToken('authToken')->plainTextToken;
        $user->token = $token;
        $user->save();

        return response()->json([
            'user' => $user,
            'token' => $token,
        ], 200);
    }


    function userData(Request $request){
        $user = User::where('token', $request->token)->first();
        // $user = User::find($request->id);
        // dd($request->token);
        if(!$user){
            return response()->json([
                'error' => 'Can not find the user data.',
            ], 401);
        }
        return response()->json([
            'user'=> $user
        ], 200);
    }

    function logout(Request $request){
        $user = User::where('token', $request->token)->first();
        if($user){
            $user->token = null;
            $user->save();
            return response()->json([
                'message' => 'Logged out successfully.'
            ], 200);
        }
        return response()->json([
            'error' => 'Unauthorized.'
        ], 401);
    }

}

