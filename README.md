# BackFinder

TODO:

- Child process
- Extensions filtering

Vulnerabilities to output (`--only-writable`):

- Looking for a file in writable dir
- Reading writable file
- Looking for a dir in writable dir
- Loading writable DLL
- Enumerating writable dir
- Executing writable image (EXE, DLL)
- Spawning shell with writable .ps1, .cmd

```text
NtQueryDirectoryFile, NtQueryDirectoryFileEx, NtQueryInformationFile, NtSetInformationFile, NtQueryAttributesFile, NtQueryFullAttributesFile, NtDeleteFile, NtClose
```
