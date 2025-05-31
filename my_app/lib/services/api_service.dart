
import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import '../models/message.dart';

class ApiService {
  static const String baseUrl = 'https://portfoliobackend-39ou.onrender.com/api/chat';
static Future<List<String>> getUserList() async {
  final response = await http.get(Uri.parse('$baseUrl/users')); // ✅ correct endpoint

  if (response.statusCode == 200) {
    final List<dynamic> json = jsonDecode(response.body);
    return json.map((user) => user['_id'].toString()).toList(); // ✅ extract only senderId
  } else {
    throw Exception('Failed to load user list');
  }
}


  // ✅ Get all messages for a specific user
  static Future<List<Message>> getMessages(String userId) async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/messages/$userId'));

      if (response.statusCode == 200) {
        final List<dynamic> jsonData = json.decode(response.body);
        return jsonData.map((item) => Message.fromJson(item)).toList();
      } else {
        throw Exception('Failed to load messages');
      }
    } catch (e) {
      print('❌ API getMessages error: $e');
      return [];
    }
  }

  // ✅ Send a message from admin
static Future<void> sendMessage(String userId, String message, [File? file]) async {
  var uri = Uri.parse('$baseUrl/send');

  var request = http.MultipartRequest('POST', uri)
    ..fields['senderId'] = userId
    ..fields['senderType'] = 'admin'
    ..fields['message'] = message;

  if (file != null) {
    request.files.add(await http.MultipartFile.fromPath('files', file.path));
  }

  var response = await request.send();

  if (response.statusCode != 200) {
    throw Exception('Failed to send message');
  }
}


  // ✅ Mark all user messages as read when admin views the chat
static Future<void> markMessagesAsRead(String userId) async {
  final res = await http.put(Uri.parse('$baseUrl/mark-read/$userId'));
  if (res.statusCode != 200) {
    throw Exception("Failed to mark messages as read");
  }
}

}
