  // ✅ chat_page.dart

  import 'dart:async';
  import 'dart:io';
  import 'package:flutter/material.dart';
  import 'package:file_picker/file_picker.dart';
import 'package:my_app/services/notification_service.dart';
  import 'package:url_launcher/url_launcher.dart';
  import '../models/message.dart';
  import '../services/api_service.dart';

  class ChatPage extends StatefulWidget {
    final String userId;
    const ChatPage({super.key, required this.userId});

    @override
    State<ChatPage> createState() => _ChatPageState();
  }

  class _ChatPageState extends State<ChatPage> {
    List<Message> messages = [];
    final TextEditingController _msgController = TextEditingController();
    File? selectedFile;
    Timer? refreshTimer;

void loadMessages() async {
  final newMessages = await ApiService.getMessages(widget.userId);

  // Check for new unread messages from user
  final unreadFromUser = newMessages.where((m) =>
    m.senderType == 'user' &&
    !m.read &&
    !messages.any((old) => old.id == m.id) // compare old vs new
  );

  if (unreadFromUser.isNotEmpty) {
    final latest = unreadFromUser.last;
    NotificationService.showNotification("New message from user", latest.message);
  }

  setState(() => messages = newMessages);

  // Also mark user messages as read
  await ApiService.markMessagesAsRead(widget.userId);
}

    void sendMessage() async {
      if (_msgController.text.trim().isEmpty && selectedFile == null) return;
      await ApiService.sendMessage(widget.userId, _msgController.text, selectedFile);
      _msgController.clear();
      selectedFile = null;
      loadMessages();
    }

    void pickFile() async {
      final result = await FilePicker.platform.pickFiles();
      if (result != null) {
        setState(() => selectedFile = File(result.files.single.path!));
      }
    }

    @override
    void initState() {
      super.initState();
      loadMessages();
      refreshTimer = Timer.periodic(Duration(seconds: 3), (_) => loadMessages());
    }

    @override
    void dispose() {
      refreshTimer?.cancel();
      super.dispose();
    }

    @override
    Widget build(BuildContext context) {
      final firstUnread = messages.indexWhere((m) => m.senderType == 'user' && !m.read);

      return Scaffold(
        appBar: AppBar(title: Text("Chat with ${widget.userId}")),
        body: Column(
          children: [
            Expanded(
              child: ListView.builder(
                itemCount: messages.length,
                itemBuilder: (ctx, index) {
                  final msg = messages[index];
                  final isAdmin = msg.senderType == 'admin';
                  final isUnread = !msg.read && msg.senderType == 'user';

                  List<Widget> widgets = [];
                  if (index == firstUnread) {
                    widgets.add(Center(child: Text('--- New Messages ---')));
                  }

                  widgets.add(
                    Align(
                      alignment: isAdmin ? Alignment.centerRight : Alignment.centerLeft,
                      child: Container(
                        margin: const EdgeInsets.all(8),
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: isAdmin ? Colors.green[100] : Colors.grey[300],
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            if (msg.message.isNotEmpty) Text(msg.message),
                            if (msg.fileUrl != null)
                              TextButton(
                                child: const Text("📎 View File"),
                                onPressed: () => launchUrl(Uri.parse(msg.fileUrl!)),
                              )
                          ],
                        ),
                      ),
                    ),
                  );

                  return Column(children: widgets);
                },
              ),
            ),
            if (selectedFile != null)
              Padding(
                padding: const EdgeInsets.all(8.0),
                child: Row(
                  children: [
                    Expanded(child: Text(selectedFile!.path.split('/').last)),
                    IconButton(
                      icon: Icon(Icons.close),
                      onPressed: () => setState(() => selectedFile = null),
                    )
                  ],
                ),
              ),
            Row(
              children: [
                IconButton(icon: Icon(Icons.attach_file), onPressed: pickFile),
                Expanded(
                  child: TextField(
                    controller: _msgController,
                    decoration: const InputDecoration(hintText: "Type a message..."),
                  ),
                ),
                IconButton(icon: const Icon(Icons.send), onPressed: sendMessage),
              ],
            )
          ],
        ),
      );
    }
  }