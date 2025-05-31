import 'package:flutter/material.dart';
import 'chat_list_page.dart';

class LoginPage extends StatelessWidget {
  final TextEditingController _username = TextEditingController();
  final TextEditingController _password = TextEditingController();

  void _login(BuildContext context) {
    if (_username.text == "admin" && _password.text == "password") {
      Navigator.pushReplacement(context,
        MaterialPageRoute(builder: (_) => ChatListPage()));
    } else {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text("Invalid credentials"),
      ));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Admin Login")),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            TextField(controller: _username, decoration: InputDecoration(labelText: 'Username')),
            TextField(controller: _password, decoration: InputDecoration(labelText: 'Password'), obscureText: true),
            SizedBox(height: 20),
            ElevatedButton(onPressed: () => _login(context), child: Text("Login"))
          ],
        ),
      ),
    );
  }
}
