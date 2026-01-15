# React Native Keychain
-keep class com.reactnativecommunity.keychain.** { *; }
-keep class com.oblador.keychain.** { *; }

# Facebook Conceal
-keep class com.facebook.crypto.** { *; }
-keep class com.facebook.android.crypto.keychain.** { *; }

# React Native
-keep class com.facebook.react.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }
-keep class com.facebook.react.bridge.** { *; }

# Keep all native modules
-keep class * extends com.facebook.react.bridge.NativeModule { *; }

# Keep React methods
-keepclassmembers class * {
    @com.facebook.react.bridge.ReactMethod *;
}

# Don't obfuscate method names
-keepattributes Signature, InnerClasses, EnclosingMethod
-keepattributes *Annotation*