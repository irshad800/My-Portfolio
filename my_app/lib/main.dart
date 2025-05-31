import 'package:flutter/material.dart';
import 'pages/login_page.dart';
import 'services/notification_service.dart'; // Make sure this import is correct


void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await NotificationService.init(); // ✅ initialize notifications
  runApp(const AdminChatApp());
}

class AdminChatApp extends StatelessWidget {
  const AdminChatApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Admin Chat',
      debugShowCheckedModeBanner: false,
      home:LoginPage(), // ✅ Use `const` constructor
    );
  }
}
