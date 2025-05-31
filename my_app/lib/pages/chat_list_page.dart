import 'package:flutter/material.dart';
import '../services/api_service.dart' as api_service;
import 'chat_page.dart'; // ✅ make sure this path is correct

class ChatListPage extends StatefulWidget {
  @override
  State<ChatListPage> createState() => _ChatListPageState();
}

class _ChatListPageState extends State<ChatListPage> {
  List<String> users = [];

  void fetchUsers() async {
    final response = await api_service.ApiService.getUserList();
    setState(() {
      users = List<String>.from(response);
    });
  }

  @override
  void initState() {
    super.initState();
    fetchUsers();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text("User Messages")),
      body: ListView.builder(
        itemCount: users.length,
        itemBuilder: (_, index) {
          return ListTile(
            title: Text(users[index]),
            trailing: Icon(Icons.chat),
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => ChatPage(userId: users[index]),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
